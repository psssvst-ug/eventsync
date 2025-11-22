package com.parapf.eventsync;

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
import com.parapf.eventsync.APIs.Responses.EventsListResponse;
import com.parapf.eventsync.models.EventModel;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Events extends AppCompatActivity {

    RecyclerView eventsRecycler;
    ProgressBar loadingBar;

    ItemEventsAdapter adapter;
    List<EventModel> eventList = new ArrayList<>();

    private static final String TAG = "EventsPage";

    TextView empty;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_events);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        findViewById(R.id.finit).setOnClickListener(v -> finish());


        empty = findViewById(R.id.empty_view);

        eventsRecycler = findViewById(R.id.eventsRecycler);
        loadingBar = findViewById(R.id.loadingBar);

        adapter = new ItemEventsAdapter(
                this,
                eventList,
                new ItemEventsAdapter.OnEventClickListener() {
                    @Override
                    public void onLearnMore(EventModel event) {
                        // Show bottom sheet with event details
                        showEventDetails(event.getId());
                    }

                    @Override
                    public void onRegister(EventModel event) {
                        // TODO: start registration activity
                        showEventDetails(event.getId());
                    }
                }
        );

        eventsRecycler.setLayoutManager(new LinearLayoutManager(this));
        eventsRecycler.setAdapter(adapter);

        fetchEvents();
    }

    private void showEventDetails(String eventId) {
        EventDetailsBottomSheet bottomSheet = EventDetailsBottomSheet.newInstance(eventId);
        bottomSheet.show(getSupportFragmentManager(), "EventDetailsBottomSheet");
    }

    private void fetchEvents() {
        loadingBar.setVisibility(View.VISIBLE);

        ApiService api = ApiClient.getService(this);

        Call<EventsListResponse> call = api.getEventsList(
                1,
                20,
                "startDate",
                "asc"
        );

        call.enqueue(new Callback<EventsListResponse>() {
            @Override
            public void onResponse(Call<EventsListResponse> call, Response<EventsListResponse> response) {
                loadingBar.setVisibility(View.GONE);

                if (!response.isSuccessful() || response.body() == null) {
                    Log.e(TAG, "API Error: " + response.code());
                    empty.setVisibility(View.VISIBLE);
                    return;
                }

                EventsListResponse result = response.body();

                List<EventsListResponse.Event> apiEvents = result.getData().getEvents();
                eventList.clear();

                // Convert API model to your EventModel - NOW WITH ID
                for (EventsListResponse.Event e : apiEvents) {
                    EventModel model = new EventModel(
                            e.getId(),  // ADD THIS - Pass the event ID
                            e.getTitle(),
                            e.getDescription(),
                            e.getStartDate(),
                            e.getLocation()
                    );
                    eventList.add(model);
                }

                adapter.notifyDataSetChanged();
            }

            @Override
            public void onFailure(Call<EventsListResponse> call, Throwable t) {
                loadingBar.setVisibility(View.GONE);
                Log.e(TAG, "Network Error: " + t.getMessage());
            }
        });
    }
}