package com.parapf.eventsync;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.chip.Chip;
import com.parapf.eventsync.models.RegistrationModel;

import java.util.List;

public class ItemRegisteredEventsAdapter extends RecyclerView.Adapter<ItemRegisteredEventsAdapter.RegistrationViewHolder> {

    private Context context;
    private List<RegistrationModel> registrationList;
    private OnRegistrationClickListener listener;

    public interface OnRegistrationClickListener {
        void onLearnMore(RegistrationModel registration);
    }

    public ItemRegisteredEventsAdapter(Context context, List<RegistrationModel> registrationList, OnRegistrationClickListener listener) {
        this.context = context;
        this.registrationList = registrationList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public RegistrationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_registered_events, parent, false);
        return new RegistrationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RegistrationViewHolder holder, int position) {
        RegistrationModel registration = registrationList.get(position);

        holder.title.setText(registration.getEventTitle());
        holder.desc.setText(registration.getEventDescription());
        holder.timeline.setText(registration.getTimeline());
        holder.venue.setText(registration.getLocation());

        // Show team name as a badge/chip (optional - you can add this to your layout)
        if (holder.teamChip != null && registration.getTeamName() != null) {
            holder.teamChip.setText(registration.getTeamName());
            holder.teamChip.setVisibility(View.VISIBLE);
        }

        // Show registration status
        if (holder.statusChip != null) {
            String status = registration.getStatus();
            holder.statusChip.setText(status != null ? status.toUpperCase() : "REGISTERED");

            // Color code based on status
            if ("confirmed".equalsIgnoreCase(status)) {
                holder.statusChip.setChipBackgroundColorResource(R.color.md_primary);
            } else if ("checked_in".equalsIgnoreCase(status) || registration.isCheckedIn()) {
                holder.statusChip.setChipBackgroundColorResource(R.color.success_green);
                holder.statusChip.setText("CHECKED IN");
            } else if ("cancelled".equalsIgnoreCase(status)) {
                holder.statusChip.setChipBackgroundColorResource(R.color.md_error);
            } else {
                holder.statusChip.setChipBackgroundColorResource(R.color.md_secondary);
            }
            holder.statusChip.setVisibility(View.VISIBLE);
        }

        // Learn More Click
        holder.learnMore.setOnClickListener(v -> listener.onLearnMore(registration));
    }

    @Override
    public int getItemCount() {
        return registrationList.size();
    }

    public static class RegistrationViewHolder extends RecyclerView.ViewHolder {

        TextView title, desc, timeline, venue;
        MaterialButton learnMore;
        MaterialCardView card;
        Chip statusChip, teamChip;

        public RegistrationViewHolder(@NonNull View itemView) {
            super(itemView);

            card = itemView.findViewById(R.id.cardView);
            title = itemView.findViewById(R.id.title);
            desc = itemView.findViewById(R.id.desc);
            timeline = itemView.findViewById(R.id.timeline);
            venue = itemView.findViewById(R.id.venue);
            learnMore = itemView.findViewById(R.id.learnMore);

            // Optional chips (add these to your layout if you want them)
            statusChip = itemView.findViewById(R.id.statusChip);
            teamChip = itemView.findViewById(R.id.teamChip);
        }
    }
}