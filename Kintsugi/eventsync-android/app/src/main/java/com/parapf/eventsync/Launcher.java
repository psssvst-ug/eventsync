package com.parapf.eventsync;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.parapf.eventsync.APIs.ApiClient;
import com.parapf.eventsync.APIs.ApiService;
import com.parapf.eventsync.APIs.Responses.SessionResponse;
import com.parapf.eventsync.APIs.TokenManager;
import com.parapf.eventsync.APIs.UserSessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Launcher extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_launcher);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });


        String cookie = TokenManager.getInstance(this).getSessionCookie();

        if (cookie == null) {
            goToLogin();
            return;
        }

        ApiService api = ApiClient.getService(this);

        api.getSession(cookie).enqueue(new Callback<SessionResponse>() {
            @Override
            public void onResponse(Call<SessionResponse> call, Response<SessionResponse> res) {

                if (res.isSuccessful() && res.body() != null) {
                    SessionResponse data = res.body();

                    // fill in-memory session
                    UserSessionManager.getInstance().saveSession(
                            data.session.token,
                            data.session.expiresAt,
                            data.session.createdAt,
                            data.session.updatedAt,
                            data.session.ipAddress,
                            data.session.userAgent,
                            data.session.userId,
                            data.session.id,

                            data.user.name,
                            data.user.email,
                            data.user.emailVerified,
                            data.user.image,
                            data.user.createdAt,
                            data.user.updatedAt,
                            data.user.role,
                            data.user.banned,
                            data.user.banReason,
                            data.user.banExpires
                    );


                    if (UserSessionManager.getInstance().getUserId() != null) {
                        goToMain();
                    } else {
                        goToLogin();
                    }
                } else {
                    goToLogin();
                }
            }

            @Override
            public void onFailure(Call<SessionResponse> call, Throwable t) {
                goToLogin();
            }
        });
    }
    private void goToMain() {
        startActivity(new Intent(this, MainActivity.class));
        finish();
    }

    private void goToLogin() {
        startActivity(new Intent(this, Login.class));
        finish();
    }
}