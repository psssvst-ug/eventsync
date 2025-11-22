package com.parapf.eventsync;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.chip.Chip;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.parapf.eventsync.APIs.ApiClient;
import com.parapf.eventsync.APIs.ApiService;
import com.parapf.eventsync.APIs.Responses.EventResponse;
import com.parapf.eventsync.models.PageDesign;
import com.parapf.eventsync.utils.PageBlockRenderer;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EventDetailsBottomSheet extends BottomSheetDialogFragment {

    private static final String ARG_EVENT_ID = "event_id";
    private static final String TAG = "EventDetailsBottomSheet";

    private String eventId;

    // Views
    private ProgressBar loadingProgress;
    private LinearLayout contentContainer;
    private TextView eventTitle;
    private TextView eventDescription;
    private TextView eventStartDate;
    private TextView eventEndDate;
    private TextView eventLocation;
    private TextView eventCapacity;
    private TextView eventDeadline;
    private Chip statusChip;
    private MaterialButton btnClose;
    private MaterialButton btnRegister;
    private LinearLayout capacityLayout;
    private LinearLayout pageContentContainer;
    private View pageContentDivider;

    private PageBlockRenderer pageRenderer;
    private Gson gson;

    public static EventDetailsBottomSheet newInstance(String eventId) {
        EventDetailsBottomSheet fragment = new EventDetailsBottomSheet();
        Bundle args = new Bundle();
        args.putString(ARG_EVENT_ID, eventId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            eventId = getArguments().getString(ARG_EVENT_ID);
        }
        pageRenderer = new PageBlockRenderer(requireContext());
        gson = new Gson();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.bottom_sheet_event_details, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Initialize views
        loadingProgress = view.findViewById(R.id.loadingProgress);
        contentContainer = view.findViewById(R.id.contentContainer);
        eventTitle = view.findViewById(R.id.eventTitle);
        eventDescription = view.findViewById(R.id.eventDescription);
        eventStartDate = view.findViewById(R.id.eventStartDate);
        eventEndDate = view.findViewById(R.id.eventEndDate);
        eventLocation = view.findViewById(R.id.eventLocation);
        eventCapacity = view.findViewById(R.id.eventCapacity);
        eventDeadline = view.findViewById(R.id.eventDeadline);
        statusChip = view.findViewById(R.id.statusChip);
        btnClose = view.findViewById(R.id.btnClose);
        btnRegister = view.findViewById(R.id.btnRegister);
        capacityLayout = view.findViewById(R.id.capacityLayout);
        pageContentContainer = view.findViewById(R.id.pageContentContainer);
        pageContentDivider = view.findViewById(R.id.pageContentDivider);

        btnClose.setOnClickListener(v -> dismiss());
        btnRegister.setOnClickListener(v -> {
            if (isAdded() && getContext() != null) {
                Toast.makeText(getContext(), "Registration feature coming soon!", Toast.LENGTH_SHORT).show();
            }
        });

        fetchEventDetails();
    }

    private void fetchEventDetails() {
        if (eventId == null || eventId.isEmpty()) {
            if (isAdded() && getContext() != null) {
                Toast.makeText(getContext(), "Invalid event ID", Toast.LENGTH_SHORT).show();
            }
            dismiss();
            return;
        }

        showLoading(true);

        ApiService api = ApiClient.getService(requireContext());
        Call<EventResponse> call = api.getEventById(eventId);

        call.enqueue(new Callback<EventResponse>() {
            @Override
            public void onResponse(Call<EventResponse> call, Response<EventResponse> response) {
                // Check if fragment is still attached
                if (!isAdded() || getContext() == null) {
                    return;
                }

                showLoading(false);

                if (!response.isSuccessful() || response.body() == null) {
                    Log.e(TAG, "API Error: " + response.code());
                    showToast("Failed to load event details");
                    dismiss();
                    return;
                }

                EventResponse eventResponse = response.body();
                if (eventResponse.isSuccess() && eventResponse.getData() != null) {
                    displayEventDetails(eventResponse.getData());
                } else {
                    showToast("Event not found");
                    dismiss();
                }
            }

            @Override
            public void onFailure(Call<EventResponse> call, Throwable t) {
                // Check if fragment is still attached
                if (!isAdded() || getContext() == null) {
                    return;
                }

                showLoading(false);
                Log.e(TAG, "Network Error: " + t.getMessage(), t);
                showToast("Network error: " + t.getMessage());
                dismiss();
            }
        });
    }

    private void displayEventDetails(EventResponse.EventData event) {
        // Check if fragment is still attached
        if (!isAdded() || getContext() == null) {
            return;
        }

        // Set title
        eventTitle.setText(event.getTitle());

        // Set description
        eventDescription.setText(event.getDescription());

        // Set status chip
        String status = event.getStatus();
        if (status != null) {
            statusChip.setText(status.toUpperCase());
            if ("published".equalsIgnoreCase(status)) {
                statusChip.setChipBackgroundColorResource(R.color.md_primary);
            } else if ("draft".equalsIgnoreCase(status)) {
                statusChip.setChipBackgroundColorResource(R.color.md_secondary);
            } else if ("cancelled".equalsIgnoreCase(status)) {
                statusChip.setChipBackgroundColorResource(R.color.md_error);
            }
        }

        // Set dates
        eventStartDate.setText(formatDate(event.getStartDate()));
        eventEndDate.setText(formatDate(event.getEndDate()));
        eventDeadline.setText(formatDate(event.getRegistrationDeadline()));

        // Set location
        eventLocation.setText(event.getLocation());

        // Set capacity
        if (event.getMaxCapacity() != null) {
            eventCapacity.setText(event.getMaxCapacity() + " attendees");
            capacityLayout.setVisibility(View.VISIBLE);
        } else {
            capacityLayout.setVisibility(View.GONE);
        }

        // Render JSONB page content
        renderPageContent(event.getPage());
    }

    private void renderPageContent(JsonObject pageJson) {
        // Check if fragment is still attached
        if (!isAdded() || getContext() == null) {
            return;
        }

        // Check if pageJson is null or doesn't have blocks
        if (pageJson == null || pageJson.isJsonNull() || !pageJson.has("blocks")) {
            pageContentContainer.setVisibility(View.GONE);
            pageContentDivider.setVisibility(View.GONE);
            return;
        }

        try {
            // Parse JSONB to PageDesign object
            PageDesign pageDesign = gson.fromJson(pageJson, PageDesign.class);

            if (pageDesign != null && pageDesign.getBlocks() != null && !pageDesign.getBlocks().isEmpty()) {
                // Clear previous content
                pageContentContainer.removeAllViews();

                // Render all blocks
                pageRenderer.renderBlocks(pageDesign.getBlocks(), pageContentContainer);

                // Show the container and divider
                pageContentContainer.setVisibility(View.VISIBLE);
                pageContentDivider.setVisibility(View.VISIBLE);

                Log.d(TAG, "Rendered " + pageDesign.getBlocks().size() + " page blocks");
            } else {
                pageContentContainer.setVisibility(View.GONE);
                pageContentDivider.setVisibility(View.GONE);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error rendering page content: " + e.getMessage(), e);
            pageContentContainer.setVisibility(View.GONE);
            pageContentDivider.setVisibility(View.GONE);
        }
    }

    private String formatDate(String isoDate) {
        if (isoDate == null || isoDate.isEmpty()) {
            return "N/A";
        }

        try {
            // Try parsing with milliseconds first
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            inputFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = inputFormat.parse(isoDate);

            if (date == null) {
                // Try without milliseconds (space separator format from API)
                inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
                date = inputFormat.parse(isoDate);
            }

            if (date != null) {
                SimpleDateFormat outputFormat = new SimpleDateFormat("MMM dd, yyyy hh:mm a", Locale.getDefault());
                return outputFormat.format(date);
            }
        } catch (ParseException e) {
            Log.e(TAG, "Date parsing error for: " + isoDate + " - " + e.getMessage());
        }

        // Fallback: return as-is
        return isoDate;
    }

    private void showLoading(boolean isLoading) {
        if (!isAdded()) return;

        if (isLoading) {
            loadingProgress.setVisibility(View.VISIBLE);
            contentContainer.setVisibility(View.GONE);
        } else {
            loadingProgress.setVisibility(View.GONE);
            contentContainer.setVisibility(View.VISIBLE);
        }
    }

    /**
     * Safe toast method that checks if fragment is attached
     */
    private void showToast(String message) {
        if (isAdded() && getContext() != null) {
            Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        // Clean up references to prevent memory leaks
        loadingProgress = null;
        contentContainer = null;
        eventTitle = null;
        eventDescription = null;
        eventStartDate = null;
        eventEndDate = null;
        eventLocation = null;
        eventCapacity = null;
        eventDeadline = null;
        statusChip = null;
        btnClose = null;
        btnRegister = null;
        capacityLayout = null;
        pageContentContainer = null;
        pageContentDivider = null;
    }
}