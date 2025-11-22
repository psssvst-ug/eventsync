package com.parapf.eventsync;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.parapf.eventsync.APIs.ApiClient;
import com.parapf.eventsync.APIs.ApiService;
import com.parapf.eventsync.APIs.Responses.MyEventsResponse;
import com.parapf.eventsync.models.EventModel;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyEvents extends AppCompatActivity {

    RecyclerView eventsRecycler;
    ProgressBar loadingBar;

    ItemMyEventsAdapter adapter;
    List<EventModel> eventList = new ArrayList<>();

    private static final String TAG = "MyEventsPage";

    TextView empty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_my_events);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        findViewById(R.id.finit).setOnClickListener(v -> finish());

        empty = findViewById(R.id.empty_view);

        eventsRecycler = findViewById(R.id.eventsRecycler);
        loadingBar = findViewById(R.id.loadingBar);

        adapter = new ItemMyEventsAdapter(
                this,
                eventList,
                new ItemMyEventsAdapter.OnEventClickListener() {
                    @Override
                    public void onAttendance(EventModel event) {
                        // Show bottom sheet with event details or navigate to attendance
                        showAttendanceScreen(event);
                    }
                }
        );

        eventsRecycler.setLayoutManager(new LinearLayoutManager(this));
        eventsRecycler.setAdapter(adapter);

        fetchMyEvents();
    }

    private void showAttendanceScreen(EventModel event) {
        // TODO: Navigate to attendance/scanner screen
        // For now, show event details
        EventDetailsBottomSheet bottomSheet = EventDetailsBottomSheet.newInstance(event.getId());
        bottomSheet.show(getSupportFragmentManager(), "EventDetailsBottomSheet");
    }

    private void fetchMyEvents() {
        loadingBar.setVisibility(View.VISIBLE);
        empty.setVisibility(View.GONE);

        ApiService api = ApiClient.getService(this);

        // Get cookie from SharedPreferences
        SharedPreferences prefs = getSharedPreferences("EventSync", Context.MODE_PRIVATE);
        String cookie = prefs.getString("session_cookie", "");

        Call<MyEventsResponse> call = api.getMyEvents(cookie);

        call.enqueue(new Callback<MyEventsResponse>() {
            @Override
            public void onResponse(Call<MyEventsResponse> call, Response<MyEventsResponse> response) {
                loadingBar.setVisibility(View.GONE);

                if (!response.isSuccessful()) {
                    Log.e(TAG, "API Error: " + response.code());
                    if (response.code() == 401) {
                        empty.setText("Session expired. Please login again.");
                    } else {
                        empty.setText("Failed to load events (Error " + response.code() + ")");
                    }
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                MyEventsResponse result = response.body();

                if (result == null) {
                    Log.e(TAG, "Response body is null");
                    empty.setText("Failed to load events");
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                if (!result.isSuccess()) {
                    Log.e(TAG, "API returned success=false: " + result.getMessage());
                    empty.setText(result.getMessage() != null ? result.getMessage() : "Failed to load events");
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                if (result.getData() == null || result.getData().isEmpty()) {
                    empty.setText("No events found.\nCreate your first event to get started!");
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                List<MyEventsResponse.Event> apiEvents = result.getData();
                eventList.clear();

                // Convert API model to EventModel
                for (MyEventsResponse.Event e : apiEvents) {
                    // Format the timeline text for display
                    String timeline = formatDateRange(e.getStartDate(), e.getEndDate());

                    // Create EventModel with basic constructor (for RecyclerView display)
                    EventModel model = new EventModel(
                            e.getId(),
                            e.getTitle(),
                            e.getDescription(),
                            timeline,
                            e.getLocation()
                    );

                    // Set additional properties (useful for detail views)
                    model.setImageUrl(e.getImageUrl());
                    model.setStartDate(e.getStartDate());
                    model.setEndDate(e.getEndDate());
                    model.setLocation(e.getLocation());
                    model.setMaxCapacity(e.getMaxCapacity());
                    model.setStatus(e.getStatus());

                    eventList.add(model);
                }

                adapter.notifyDataSetChanged();

                Log.d(TAG, "Loaded " + eventList.size() + " events successfully");
            }

            @Override
            public void onFailure(Call<MyEventsResponse> call, Throwable t) {
                loadingBar.setVisibility(View.GONE);
                empty.setVisibility(View.VISIBLE);
                empty.setText("Network error\n" + t.getMessage());
                Log.e(TAG, "Network Error: " + t.getMessage(), t);
            }
        });
    }

    /**
     * Helper method to format date range for display
     * Converts ISO 8601 dates to readable format
     */
    private String formatDateRange(String startDate, String endDate) {
        try {
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            isoFormat.setTimeZone(TimeZone.getTimeZone("UTC"));

            SimpleDateFormat displayFormat = new SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.US);

            if (startDate != null && endDate != null) {
                Date start = isoFormat.parse(startDate);
                Date end = isoFormat.parse(endDate);

                if (start != null && end != null) {
                    // Check if same day
                    SimpleDateFormat dayFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                    String startDay = dayFormat.format(start);
                    String endDay = dayFormat.format(end);

                    if (startDay.equals(endDay)) {
                        // Same day: "Nov 22, 2025 09:00 - 17:00"
                        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.US);
                        return new SimpleDateFormat("MMM dd, yyyy", Locale.US).format(start) +
                                " " + timeFormat.format(start) + " - " + timeFormat.format(end);
                    } else {
                        // Different days: "Nov 22 - Nov 23, 2025"
                        return displayFormat.format(start) + " - " + displayFormat.format(end);
                    }
                }
            } else if (startDate != null) {
                Date start = isoFormat.parse(startDate);
                if (start != null) {
                    return displayFormat.format(start);
                }
            }
            return "Date not available";
        } catch (ParseException e) {
            Log.e(TAG, "Error parsing date: " + e.getMessage());
            // Fallback: try simple substring
            try {
                if (startDate != null && endDate != null) {
                    String start = startDate.substring(0, 10); // Gets YYYY-MM-DD
                    String end = endDate.substring(0, 10);
                    return start + " to " + end;
                } else if (startDate != null) {
                    return startDate.substring(0, 10);
                }
            } catch (Exception ex) {
                Log.e(TAG, "Fallback date formatting failed: " + ex.getMessage());
            }
            return "Date not available";
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Refresh events when returning to this screen
        fetchMyEvents();
    }
}