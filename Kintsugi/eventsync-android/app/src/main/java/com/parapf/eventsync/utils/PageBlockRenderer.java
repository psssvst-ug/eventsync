package com.parapf.eventsync.utils;

import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Typeface;
import android.text.Html;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Space;
import android.widget.TextView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.gson.JsonObject;
import com.parapf.eventsync.R;
import com.parapf.eventsync.models.PageBlock;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class PageBlockRenderer {

    private Context context;
    private boolean isDarkMode;

    public PageBlockRenderer(Context context) {
        this.context = context;
        this.isDarkMode = isSystemInDarkMode();
    }

    /**
     * Check if system is in dark mode
     */
    private boolean isSystemInDarkMode() {
        int nightModeFlags = context.getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK;
        return nightModeFlags == Configuration.UI_MODE_NIGHT_YES;
    }

    /**
     * Get themed color from attributes
     */
    private int getThemeColor(int attrId) {
        TypedValue typedValue = new TypedValue();
        context.getTheme().resolveAttribute(attrId, typedValue, true);
        return typedValue.data;
    }

    /**
     * Render all blocks into a LinearLayout container
     */
    public void renderBlocks(List<PageBlock> blocks, LinearLayout container) {
        if (blocks == null || blocks.isEmpty()) {
            return;
        }

        // Sort blocks by order
        Collections.sort(blocks, new Comparator<PageBlock>() {
            @Override
            public int compare(PageBlock b1, PageBlock b2) {
                return Integer.compare(b1.getOrder(), b2.getOrder());
            }
        });

        // Render each block
        for (PageBlock block : blocks) {
            View view = renderBlock(block);
            if (view != null) {
                container.addView(view);
            }
        }
    }

    /**
     * Render a single block based on its type
     */
    private View renderBlock(PageBlock block) {
        String type = block.getType();

        if (type == null) {
            return null;
        }

        switch (type) {
            case "heading":
                return renderHeading(block);
            case "paragraph":
                return renderParagraph(block);
            case "image":
                return renderImage(block);
            case "button":
                return renderButton(block);
            case "spacer":
                return renderSpacer(block);
            case "divider":
                return renderDivider(block);
            case "video":
                return renderVideo(block);
            case "link":
                return renderLink(block);
            case "quote":
                return renderQuote(block);
            case "code":
                return renderCode(block);
            default:
                return renderUnknownBlock(block);
        }
    }

    // === RENDERERS ===

    private View renderHeading(PageBlock block) {
        TextView textView = new TextView(context);

        String content = block.getContent();
        if (content != null) {
            textView.setText(Html.fromHtml(content, Html.FROM_HTML_MODE_COMPACT));
        }

        // Set heading level
        Integer level = block.getLevel();
        if (level == null) level = 2;

        float textSize;
        switch (level) {
            case 1: textSize = 32; break;
            case 2: textSize = 28; break;
            case 3: textSize = 24; break;
            case 4: textSize = 20; break;
            case 5: textSize = 18; break;
            case 6: textSize = 16; break;
            default: textSize = 24;
        }
        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, textSize);
        textView.setTypeface(null, Typeface.BOLD);
        textView.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnSurface));

        // Apply custom styles
        applyTextStyle(textView, block.getStyle());

        // Margins
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, dpToPx(16), 0, dpToPx(8));
        textView.setLayoutParams(params);

        return textView;
    }

    private View renderParagraph(PageBlock block) {
        TextView textView = new TextView(context);

        String content = block.getContent();
        if (content != null) {
            textView.setText(Html.fromHtml(content, Html.FROM_HTML_MODE_COMPACT));
        }

        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        textView.setLineSpacing(dpToPx(4), 1.0f);
        textView.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnSurfaceVariant));
        textView.setFontFeatureSettings("@font/outfit_regular");

        // Apply custom styles
        applyTextStyle(textView, block.getStyle());

        // Margins
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, dpToPx(8), 0, dpToPx(8));
        textView.setLayoutParams(params);

        return textView;
    }

    private View renderImage(PageBlock block) {
        String url = block.getUrl();
        if (url == null || url.isEmpty()) {
            return null;
        }

        LinearLayout container = new LinearLayout(context);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        // Create MaterialCardView for image
        MaterialCardView cardView = new MaterialCardView(context);
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dpToPx(200)
        );
        cardParams.setMargins(0, dpToPx(8), 0, dpToPx(8));
        cardView.setLayoutParams(cardParams);
        cardView.setCardBackgroundColor(getThemeColor(com.google.android.material.R.attr.colorSurfaceVariant));

        if (block.getRounded() != null && block.getRounded()) {
            cardView.setRadius(dpToPx(16));
        } else {
            cardView.setRadius(dpToPx(8));
        }

        if (block.getBorder() != null && block.getBorder()) {
            cardView.setStrokeWidth(dpToPx(1));
            cardView.setStrokeColor(getThemeColor(com.google.android.material.R.attr.colorOutline));
        }

        ImageView imageView = new ImageView(context);
        imageView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);

        // TODO: Load image with Glide or Picasso
        // Glide.with(context).load(url).placeholder(R.drawable.placeholder).into(imageView);

        cardView.addView(imageView);
        container.addView(cardView);

        // Caption
        String caption = block.getCaption();
        if (caption != null && !caption.isEmpty()) {
            TextView captionView = new TextView(context);
            captionView.setText(caption);
            captionView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            captionView.setGravity(Gravity.CENTER);
            captionView.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnSurfaceVariant));
            LinearLayout.LayoutParams captionParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
            );
            captionParams.setMargins(0, dpToPx(4), 0, 0);
            captionView.setLayoutParams(captionParams);
            container.addView(captionView);
        }

        return container;
    }

    private View renderButton(PageBlock block) {
        MaterialButton button = new MaterialButton(context);

        String text = block.getText();
        if (text != null) {
            button.setText(text);
        }

        // Set button size
        String size = block.getSize();
        int height = dpToPx(48);
        if ("lg".equals(size)) {
            height = dpToPx(56);
        } else if ("sm".equals(size)) {
            height = dpToPx(40);
        }

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                height
        );

        // Alignment
        String alignment = block.getAlignment();
        if ("center".equals(alignment)) {
            params.gravity = Gravity.CENTER;
        } else if ("right".equals(alignment)) {
            params.gravity = Gravity.END;
        } else {
            params.gravity = Gravity.START;
        }

        params.setMargins(0, dpToPx(12), 0, dpToPx(12));
        button.setLayoutParams(params);

        // TODO: Handle click with URL
        // String url = block.getUrl();

        return button;
    }

    private View renderSpacer(PageBlock block) {
        Space space = new Space(context);

        String heightStr = block.getSpacerHeight();
        int height = dpToPx(24); // default

        if (heightStr != null) {
            try {
                height = dpToPx(Integer.parseInt(heightStr.replace("px", "")));
            } catch (NumberFormatException e) {
                // use default
            }
        }

        space.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                height
        ));

        return space;
    }

    private View renderDivider(PageBlock block) {
        View divider = new View(context);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dpToPx(1)
        );
        params.setMargins(0, dpToPx(16), 0, dpToPx(16));
        divider.setLayoutParams(params);

        // Color - use theme color by default
        String color = block.getDividerColor();
        if (color != null) {
            try {
                divider.setBackgroundColor(Color.parseColor(color));
            } catch (IllegalArgumentException e) {
                divider.setBackgroundColor(getThemeColor(com.google.android.material.R.attr.colorOutline));
            }
        } else {
            divider.setBackgroundColor(getThemeColor(com.google.android.material.R.attr.colorOutline));
        }

        return divider;
    }

    private View renderVideo(PageBlock block) {
        // Create a styled placeholder for video
        MaterialCardView cardView = new MaterialCardView(context);
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dpToPx(180)
        );
        cardParams.setMargins(0, dpToPx(12), 0, dpToPx(12));
        cardView.setLayoutParams(cardParams);
        cardView.setRadius(dpToPx(12));
        cardView.setCardBackgroundColor(getThemeColor(com.google.android.material.R.attr.colorSurfaceVariant));

        TextView placeholder = new TextView(context);
        placeholder.setText(context.getString(R.string.video_content, block.getVideoUrl()));
        placeholder.setGravity(Gravity.CENTER);
        placeholder.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnSurfaceVariant));
        placeholder.setPadding(dpToPx(16), dpToPx(24), dpToPx(16), dpToPx(24));

        cardView.addView(placeholder);
        return cardView;
    }

    private View renderLink(PageBlock block) {
        TextView textView = new TextView(context);

        String content = block.getContent();
        if (content != null) {
            textView.setText(content);
        }

        textView.setTextColor(context.getColor(R.color.md_primary));
        textView.setPaintFlags(textView.getPaintFlags() | android.graphics.Paint.UNDERLINE_TEXT_FLAG);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, dpToPx(8), 0, dpToPx(8));
        textView.setLayoutParams(params);

        return textView;
    }

    private View renderQuote(PageBlock block) {
        // Create a card for quote
        MaterialCardView cardView = new MaterialCardView(context);
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        cardParams.setMargins(0, dpToPx(12), 0, dpToPx(12));
        cardView.setLayoutParams(cardParams);
        cardView.setRadius(dpToPx(8));
        cardView.setCardBackgroundColor(getThemeColor(com.google.android.material.R.attr.colorSurfaceVariant));
        cardView.setStrokeWidth(dpToPx(2));
        cardView.setStrokeColor(getThemeColor(com.google.android.material.R.attr.colorOnPrimary));

        TextView textView = new TextView(context);
        String content = block.getContent();
        if (content != null) {
            textView.setText("\" " + content + " \"");
        }
        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
//        textView.setFontF(Typeface.ITALIC);
        textView.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnSurface));
        textView.setPadding(dpToPx(16), dpToPx(16), dpToPx(16), dpToPx(16));

        cardView.addView(textView);
        return cardView;
    }

    private View renderCode(PageBlock block) {
        MaterialCardView cardView = new MaterialCardView(context);
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        cardParams.setMargins(0, dpToPx(12), 0, dpToPx(12));
        cardView.setLayoutParams(cardParams);
        cardView.setRadius(dpToPx(8));
        cardView.setCardBackgroundColor(isDarkMode ? Color.parseColor("#1F1F1F") : Color.parseColor("#F5F5F5"));

        TextView textView = new TextView(context);
        String content = block.getContent();
        if (content != null) {
            textView.setText(content);
        }
        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        textView.setTypeface(Typeface.MONOSPACE);
        textView.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnSurface));
        textView.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));

        cardView.addView(textView);
        return cardView;
    }

    private View renderUnknownBlock(PageBlock block) {
        TextView textView = new TextView(context);
        textView.setText(context.getString(R.string.unknown_block_type, block.getType()));
        textView.setTextColor(getThemeColor(com.google.android.material.R.attr.colorOnError));
        textView.setPadding(dpToPx(8), dpToPx(8), dpToPx(8), dpToPx(8));
        return textView;
    }

    // === HELPER METHODS ===

    private void applyTextStyle(TextView textView, JsonObject style) {
        if (style == null) {
            return;
        }

        // Bold
        if (style.has("bold") && style.get("bold").getAsBoolean()) {
            textView.setTypeface(null, Typeface.BOLD);
        }

        // Italic
        if (style.has("italic") && style.get("italic").getAsBoolean()) {
            textView.setTypeface(null, Typeface.ITALIC);
        }

        // Color
        if (style.has("color")) {
            try {
                String color = style.get("color").getAsString();
                textView.setTextColor(Color.parseColor(color));
            } catch (Exception e) {
                // ignore
            }
        }

        // Background Color
        if (style.has("backgroundColor")) {
            try {
                String bgColor = style.get("backgroundColor").getAsString();
                textView.setBackgroundColor(Color.parseColor(bgColor));
            } catch (Exception e) {
                // ignore
            }
        }

        // Text Align
        if (style.has("textAlign")) {
            String align = style.get("textAlign").getAsString();
            if ("center".equals(align)) {
                textView.setGravity(Gravity.CENTER);
            } else if ("right".equals(align)) {
                textView.setGravity(Gravity.END);
            } else if ("justify".equals(align)) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    textView.setJustificationMode(android.text.Layout.JUSTIFICATION_MODE_INTER_WORD);
                }
            } else {
                textView.setGravity(Gravity.START);
            }
        }

        // Font Size
        if (style.has("fontSize")) {
            try {
                String fontSize = style.get("fontSize").getAsString().replace("px", "");
                textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, Float.parseFloat(fontSize));
            } catch (Exception e) {
                // ignore
            }
        }
    }

    private int dpToPx(int dp) {
        float density = context.getResources().getDisplayMetrics().density;
        return Math.round((float) dp * density);
    }
}