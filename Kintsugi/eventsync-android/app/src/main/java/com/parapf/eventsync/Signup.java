package com.parapf.eventsync;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.parapf.eventsync.APIs.ApiClient;
import com.parapf.eventsync.APIs.ApiService;
import com.parapf.eventsync.APIs.Requests.SignUpRequest;
import com.parapf.eventsync.APIs.Responses.SignUpResponse;
import com.parapf.eventsync.APIs.TokenManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Signup extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_signup);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        TextView gotoSignin = findViewById(R.id.gotoSignin);
        TextView emailInput = findViewById(R.id.signup_email);
        TextView passwordInput = findViewById(R.id.signup_password);
        TextView nameInput = findViewById(R.id.signup_name);

        ApiService apiService = ApiClient.getService(this);


        findViewById(R.id.btnSignup).setOnClickListener(v->{


        String email = emailInput.getText().toString();
        String password = passwordInput.getText().toString();
        String name = nameInput.getText().toString();

        LoadingDialog.show(this, "Creating your account...");

        SignUpRequest signUpRequest = new SignUpRequest(email, password, name);
        apiService.signUp(signUpRequest).enqueue(new Callback<SignUpResponse>() {
            @Override
            public void onResponse(Call<SignUpResponse> call, Response<SignUpResponse> response) {
//                Log.d("[AUTH]", response.toString());
                LoadingDialog.changeText("Almost there!");
                LoadingDialog.hide();
                if (response.isSuccessful()){
                    SignUpResponse signUpResponse = response.body();
                    assert signUpResponse != null;
                    TokenManager.getInstance(getApplicationContext()).saveToken(signUpResponse.getToken());;
                }
                else {

                    String errorJson = null;JSONObject obj = null;
                    try {
                        errorJson = response.errorBody().string();


                    obj = new JSONObject(errorJson);

                    String msg = obj.getString("message"); // <-- this exists
                    String code = obj.getString("code");   // <-- this also exists

                    new AlertDialog.Builder(Signup.this)
                            .setTitle("Error")
                            .setMessage(msg)
                            .show();
                    } catch (IOException | JSONException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
            @Override
            public void onFailure(Call<SignUpResponse> call, Throwable throwable) {
                LoadingDialog.hide();
                new AlertDialog.Builder(getApplicationContext())
                        .setTitle("Error")
                        .setMessage(throwable.getLocalizedMessage())
                        .show();
            }
        });

        });

        gotoSignin.setOnClickListener(v->{
            startActivity(new Intent(this, Login.class));
            finish();
        });

    }
}