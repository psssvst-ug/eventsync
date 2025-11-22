package com.parapf.eventsync;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.parapf.eventsync.APIs.ApiClient;
import com.parapf.eventsync.APIs.ApiService;
import com.parapf.eventsync.APIs.Requests.SignInRequest;
import com.parapf.eventsync.APIs.Responses.SignInResponse;
import com.parapf.eventsync.APIs.TokenManager;

import org.json.JSONObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Login extends AppCompatActivity {

    EditText emailTV, passwordTV;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Buttons / Inputs
        TextView gotoSignup = findViewById(R.id.gotoSignup);
        emailTV = findViewById(R.id.login_email);
        passwordTV = findViewById(R.id.login_password);

        gotoSignup.setOnClickListener(v -> {
            startActivity(new Intent(Login.this, Signup.class));
            finish();
        });

        findViewById(R.id.btnLogin).setOnClickListener(v -> {
            String email = emailTV.getText().toString().trim();
            String password = passwordTV.getText().toString().trim();

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Email and password required", Toast.LENGTH_SHORT).show();
                return;
            }

            performLogin(email, password);
        });
    }

    private void performLogin(String email, String password) {

        ApiService api = ApiClient.getService(this);
        SignInRequest body = new SignInRequest(email, password);

        api.signIn(body).enqueue(new Callback<SignInResponse>() {
            @Override
            public void onResponse(Call<SignInResponse> call, Response<SignInResponse> response) {

                if (response.isSuccessful()) {

                    // *** GET COOKIE FROM HEADERS ***
                    String cookie = response.headers().get("Set-Cookie");

                    if (cookie != null && cookie.contains("better-auth.session_token")) {
                        TokenManager.getInstance(Login.this).saveSessionCookie(cookie);
                    }

                    Toast.makeText(Login.this, "Login Successful!", Toast.LENGTH_SHORT).show();

                    startActivity(new Intent(Login.this, MainActivity.class));
                    finish();
                }
                else {
                    // Extract error JSON
                    try {
                        String errJson = response.errorBody().string();
                        JSONObject obj = new JSONObject(errJson);

                        String msg = obj.optString("message", "Login failed");

                        new AlertDialog.Builder(Login.this)
                                .setTitle("Error")
                                .setMessage(msg)
                                .setPositiveButton("OK", null)
                                .show();

                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(Login.this, "Unexpected error", Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(Call<SignInResponse> call, Throwable t) {
                new AlertDialog.Builder(Login.this)
                        .setTitle("Network Error")
                        .setMessage(t.getLocalizedMessage())
                        .setPositiveButton("OK", null)
                        .show();
            }
        });
    }
}
