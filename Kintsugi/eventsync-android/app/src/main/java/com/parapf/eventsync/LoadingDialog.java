package com.parapf.eventsync;


import android.app.Activity;
import android.app.Dialog;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;

public class LoadingDialog {

    private static Dialog dialog;

    public static void show(Activity activity, String text) {
        if (dialog != null && dialog.isShowing()) return;

        dialog = new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setContentView(R.layout.dialog_loading);
        dialog.setCancelable(false);

        if (text != null && !text.isEmpty()) {
            TextView textView = dialog.findViewById(R.id.text);
            textView.setText(text);
        }

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
            dialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        }

        dialog.show();
    }

    public static void changeText(String text) {
        if (text != null && !text.isEmpty()) {
            TextView textView = dialog.findViewById(R.id.text);
            textView.setText(text);
        }
    }

    public static void hide() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        }
        dialog = null;
    }
}
