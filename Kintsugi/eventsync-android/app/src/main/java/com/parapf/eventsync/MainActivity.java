package com.parapf.eventsync;

import static android.content.ContentValues.TAG;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Menu;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.navigation.NavigationView;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.AppCompatActivity;

import com.parapf.eventsync.APIs.ApiClient;
import com.parapf.eventsync.APIs.ApiService;
import com.parapf.eventsync.APIs.Responses.UserResponse;
import com.parapf.eventsync.APIs.TokenManager;
import com.parapf.eventsync.APIs.UserData;
import com.parapf.eventsync.APIs.UserSessionManager;
import com.parapf.eventsync.databinding.ActivityMainBinding;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import androidx.navigation.Navigation;



public class MainActivity extends AppCompatActivity {

    private AppBarConfiguration mAppBarConfiguration;
    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

            setSupportActionBar(binding.appBarMain.toolbar);
            binding.appBarMain.fab.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Navigation.findNavController(MainActivity.this, R.id.nav_host_fragment_content_main)
                            .navigate(R.id.nav_registered_events);
                }
            });

        DrawerLayout drawer = binding.drawerLayout;
        NavigationView navigationView = binding.navView;
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                R.id.nav_home, R.id.nav_events, R.id.nav_registered_events)
                .setOpenableLayout(drawer)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);


        View headerView = binding.navView.getHeaderView(0);
        TextView headerName = headerView.findViewById(R.id.header_name);
        TextView headerEmail = headerView.findViewById(R.id.header_email);
        headerName.setText(UserSessionManager.getInstance().getUserName());
        headerEmail.setText(UserSessionManager.getInstance().getUserEmail());



        fetchCurrentUser();

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);
//        binding.appBarMain.fab.setVisibility(View.VISIBLE);
        return NavigationUI.navigateUp(navController, mAppBarConfiguration)
                || super.onSupportNavigateUp();
    }

    public void openEvents(MenuItem item) {
        startActivity(new Intent(getApplicationContext(), Events.class));
    }

    public void logout(MenuItem item) {
        logout();
    }

    private void logout() {
        ApiService api = ApiClient.getService(this);
        TokenManager tm = TokenManager.getInstance(this);

        String cookie = tm.getSessionCookie();

        if (cookie == null) {
            // Already logged out locally
            tm.clearAll();
            goToLogin();
            return;
        }

        api.signOut(cookie).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {

                // Always delete local session once request hits backend
                tm.clearAll();

                goToLogin();
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                tm.clearAll();
                goToLogin();
            }
        });
    }

    private void goToLogin() {
        startActivity(new Intent(this, Login.class));
        finish();
    }



    private void fetchCurrentUser() {
        ApiService api = ApiClient.getService(this);
        String cookie = TokenManager.getInstance(this).getSessionCookie();

        if (cookie == null) {
            goToLogin();
            return;
        }
        Call<UserResponse> call = api.getCurrentUser(cookie);
        call.enqueue(new Callback<UserResponse>() {
            @Override
            public void onResponse(Call<UserResponse> call, Response<UserResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    UserResponse userResponse = response.body();

                    if (userResponse.isSuccess() && userResponse.getData() != null) {
                        UserData userData = userResponse.getData();

                        // Save to in-memory session manager
                        UserSessionManager.getInstance().saveUserData(userData);

                        if(UserSessionManager.getInstance().isManager()||UserSessionManager.getInstance().isAdmin()){
                            binding.navView.getMenu().findItem(R.id.scan_qr).setVisible(true);
                        }

                        Log.d(TAG, "User: " + userData.getName() + ", Role: " + userData.getRole());
                    }
                } else {
                    Log.e(TAG, "Failed to fetch user data: " + response.code());
                    Toast.makeText(MainActivity.this, "Failed to load user data", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<UserResponse> call, Throwable t) {
                Log.e(TAG, "Network error: " + t.getMessage());
                Toast.makeText(MainActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void openQR(MenuItem item) {
        startActivity(new Intent(this, MyEvents.class));
    }

    public void openRegisteredEvents(MenuItem item) {
        startActivity(new Intent(this, RegisteredEventsPage.class));
        finish();
    }
}