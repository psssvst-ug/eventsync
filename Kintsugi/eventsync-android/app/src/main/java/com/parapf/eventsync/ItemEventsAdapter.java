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
import com.parapf.eventsync.models.EventModel;
import com.parapf.eventsync.R;

import java.util.List;

public class ItemEventsAdapter extends RecyclerView.Adapter<ItemEventsAdapter.EventViewHolder> {

    private Context context;
    private List<EventModel> eventList;
    private OnEventClickListener listener;

    public interface OnEventClickListener {
        void onLearnMore(EventModel event);
        void onRegister(EventModel event);
    }

    public ItemEventsAdapter(Context context, List<EventModel> eventList, OnEventClickListener listener) {
        this.context = context;
        this.eventList = eventList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public EventViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_events, parent, false);
        return new EventViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull EventViewHolder holder, int position) {
        EventModel event = eventList.get(position);

        holder.title.setText(event.getTitle());
        holder.desc.setText(event.getDescription());
        holder.timeline.setText(event.getTimeline());
        holder.venue.setText(event.getVenue());

        // Learn More Click
        holder.learnMore.setOnClickListener(v -> listener.onLearnMore(event));

        // Register Click
        holder.register.setOnClickListener(v -> listener.onRegister(event));
    }

    @Override
    public int getItemCount() {
        return eventList.size();
    }

    public static class EventViewHolder extends RecyclerView.ViewHolder {

        TextView title, desc, timeline, venue;
        MaterialButton learnMore, register;
        MaterialCardView card;

        public EventViewHolder(@NonNull View itemView) {
            super(itemView);

            card = itemView.findViewById(R.id.cardView);
            title = itemView.findViewById(R.id.title);
            desc = itemView.findViewById(R.id.desc);
            timeline = itemView.findViewById(R.id.timeline);
            venue = itemView.findViewById(R.id.venue);
            learnMore = itemView.findViewById(R.id.learnMore);
            register = itemView.findViewById(R.id.register);
        }
    }
}
