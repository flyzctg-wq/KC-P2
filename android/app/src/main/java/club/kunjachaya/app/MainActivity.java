package club.kunjachaya.app;

import android.os.Process;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onDestroy() {
        super.onDestroy();
        // Fully terminate the process when activity finishes/exits
        Process.killProcess(Process.myPid());
    }
}

