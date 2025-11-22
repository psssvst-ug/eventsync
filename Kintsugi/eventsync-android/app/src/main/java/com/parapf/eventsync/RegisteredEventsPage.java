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
import com.parapf.eventsync.APIs.Responses.UserRegistrationsResponse;
import com.parapf.eventsync.APIs.TokenManager;
import com.parapf.eventsync.models.RegistrationModel;

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

public class RegisteredEventsPage extends AppCompatActivity {

    RecyclerView registrationsRecycler;
    ProgressBar loadingBar;
    TextView empty;

    ItemRegisteredEventsAdapter adapter;
    List<RegistrationModel> registrationList = new ArrayList<>();

    private static final String TAG = "RegisteredEventsPage";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_registered_events_page);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Back button
        findViewById(R.id.finish).setOnClickListener(v -> finish());

        // Initialize views
        empty = findViewById(R.id.empty_view);
        registrationsRecycler = findViewById(R.id.registrationsRecycler);
        loadingBar = findViewById(R.id.loadingBar);

        // Setup adapter
        adapter = new ItemRegisteredEventsAdapter(
                this,
                registrationList,
                registration -> showEventDetails(registration.getEventId())
        );

        registrationsRecycler.setLayoutManager(new LinearLayoutManager(this));
        registrationsRecycler.setAdapter(adapter);

        fetchUserRegistrations();
    }

    private void showEventDetails(String eventId) {
        EventDetailsBottomSheet bottomSheet = EventDetailsBottomSheet.newInstance(eventId);
        bottomSheet.show(getSupportFragmentManager(), "EventDetailsBottomSheet");
    }

    private void fetchUserRegistrations() {
        loadingBar.setVisibility(View.VISIBLE);
        empty.setVisibility(View.GONE);
        registrationsRecycler.setVisibility(View.GONE);

        ApiService api = ApiClient.getService(this);

        // Get cookie from TokenManager
        String cookie = TokenManager.getInstance(this).getSessionCookie();

        if (cookie == null || cookie.isEmpty()) {
            loadingBar.setVisibility(View.GONE);
            empty.setText("Please login to view your registrations");
            empty.setVisibility(View.VISIBLE);
            return;
        }

        Call<UserRegistrationsResponse> call = api.getUserRegistrations(cookie);

        call.enqueue(new Callback<UserRegistrationsResponse>() {
            @Override
            public void onResponse(Call<UserRegistrationsResponse> call, Response<UserRegistrationsResponse> response) {
                loadingBar.setVisibility(View.GONE);

                if (!response.isSuccessful()) {
                    Log.e(TAG, "API Error: " + response.code());
                    if (response.code() == 401) {
                        empty.setText("Session expired. Please login again.");
                    } else {
                        empty.setText("Failed to load registrations (Error " + response.code() + ")");
                    }
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                UserRegistrationsResponse result = response.body();

                if (result == null) {
                    Log.e(TAG, "Response body is null");
                    empty.setText("Failed to load registrations");
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                if (!result.isSuccess()) {
                    Log.e(TAG, "API returned success=false: " + result.getMessage());
                    empty.setText(result.getMessage() != null ? result.getMessage() : "Failed to load registrations");
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                if (result.getData() == null || result.getData().getRegistrations() == null || result.getData().getRegistrations().isEmpty()) {
                    empty.setText("No event registrations found.\nRegister for events to see them here!");
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                List<UserRegistrationsResponse.Registration> apiRegistrations = result.getData().getRegistrations();
                registrationList.clear();

                // Convert API model to RegistrationModel
                for (UserRegistrationsResponse.Registration reg : apiRegistrations) {
                    UserRegistrationsResponse.Event event = reg.getEvent();
                    UserRegistrationsResponse.Team team = reg.getTeam();

                    if (event != null) {
                        // Format timeline
                        String timeline = formatDateRange(event.getStartDate(), event.getEndDate());

                        // Create RegistrationModel
                        RegistrationModel model = new RegistrationModel(
                                reg.getId(),
                                event.getId(),
                                event.getTitle(),
                                event.getDescription(),
                                timeline,
                                event.getLocation(),
                                reg.getStatus(),
                                team != null ? team.getName() : "Unknown Team"
                        );

                        // Set additional properties
                        model.setImageUrl(event.getImageUrl());
                        model.setTeamDescription(team != null ? team.getDescription() : null);
                        model.setRegisteredAt(reg.getRegisteredAt());
                        model.setCheckedInAt(reg.getCheckedInAt());
                        model.setCheckedIn(reg.getCheckedInAt() != null && !reg.getCheckedInAt().isEmpty());

                        registrationList.add(model);
                    }
                }

                adapter.notifyDataSetChanged();
                registrationsRecycler.setVisibility(View.VISIBLE);

                Log.d(TAG, "Loaded " + registrationList.size() + " registrations successfully");
            }

            @Override
            public void onFailure(Call<UserRegistrationsResponse> call, Throwable t) {
                loadingBar.setVisibility(View.GONE);
                empty.setVisibility(View.VISIBLE);
                empty.setText("Network error\n" + t.getMessage());
                Log.e(TAG, "Network Error: " + t.getMessage(), t);
            }
        });
    }

    /**
     * Helper method to format date range for display
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
                    SimpleDateFormat dayFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                    String startDay = dayFormat.format(start);
                    String endDay = dayFormat.format(end);

                    if (startDay.equals(endDay)) {
                        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.US);
                        return new SimpleDateFormat("MMM dd, yyyy", Locale.US).format(start) +
                                " " + timeFormat.format(start) + " - " + timeFormat.format(end);
                    } else {
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
            try {
                if (startDate != null && endDate != null) {
                    String start = startDate.substring(0, 10);
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
        // Refresh registrations when returning to this screen
        fetchUserRegistrations();
    }
}