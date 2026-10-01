package club.kunjachaya.app;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Process;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupDocBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        setupDocBridge();
    }

    private void setupDocBridge() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().addJavascriptInterface(new DocBridge(), "AndroidDocs");
                this.bridge.getWebView().setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                    if (url != null && (url.contains(".pdf") || url.contains("/docs/"))) {
                        String filename = url.substring(url.lastIndexOf('/') + 1);
                        if (filename.contains("?")) filename = filename.substring(0, filename.indexOf("?"));
                        if (filename.contains("#")) filename = filename.substring(0, filename.indexOf("#"));
                        final String targetFile = filename;
                        runOnUiThread(() -> {
                            new DocBridge().openPdf(targetFile, "Kunjachaya User Manual");
                        });
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class DocBridge {
        @JavascriptInterface
        public boolean isAvailable() {
            return true;
        }

        @JavascriptInterface
        public void openPdf(final String rawFilename, final String title) {
            runOnUiThread(() -> {
                try {
                    String cleanName = sanitizeDocName(rawFilename);
                    File file = copyDocToCache(cleanName);
                    if (file == null || !file.exists()) {
                        Toast.makeText(MainActivity.this, "নথিটি পাওয়া যায়নি / Document not found: " + cleanName, Toast.LENGTH_SHORT).show();
                        return;
                    }

                    Uri contentUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", file);
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(contentUri, "application/pdf");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                    Intent chooser = Intent.createChooser(intent, title != null && !title.isEmpty() ? title : "Open User Manual");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(MainActivity.this, "পিডিএফ খুলতে সমস্যা হয়েছে: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }

        @JavascriptInterface
        public void sharePdf(final String rawFilename, final String title) {
            runOnUiThread(() -> {
                try {
                    String cleanName = sanitizeDocName(rawFilename);
                    File file = copyDocToCache(cleanName);
                    if (file == null || !file.exists()) {
                        Toast.makeText(MainActivity.this, "নথিটি পাওয়া যায়নি / Document not found", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    Uri contentUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", file);
                    Intent intent = new Intent(Intent.ACTION_SEND);
                    intent.setType("application/pdf");
                    intent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    intent.putExtra(Intent.EXTRA_SUBJECT, title != null ? title : "Kunjachaya Club Documentation");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                    Intent chooser = Intent.createChooser(intent, title != null ? title : "Share Documentation");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(MainActivity.this, "শেয়ার করতে সমস্যা হয়েছে: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }

        @JavascriptInterface
        public void downloadPdf(final String rawFilename, final String displayName) {
            runOnUiThread(() -> {
                try {
                    String cleanName = sanitizeDocName(rawFilename);
                    String outName = displayName != null && !displayName.trim().isEmpty() ? displayName.trim() : cleanName;
                    if (!outName.toLowerCase().endsWith(".pdf")) {
                        outName += ".pdf";
                    }

                    boolean ok = saveDocToDownloads(cleanName, outName);
                    if (ok) {
                        Toast.makeText(MainActivity.this, "ম্যানুয়ালটি সফলভাবে 'Downloads' ফোল্ডারে সংরক্ষিত হয়েছে।", Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(MainActivity.this, "ডাউনলোড সম্পন্ন করা যায়নি।", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(MainActivity.this, "ডাউনলোডে ত্রুটি: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    private String sanitizeDocName(String raw) {
        if (raw == null) return "Kunjachaya_Club_User_Manual_Bengali.pdf";
        String s = raw.trim();
        if (s.startsWith("/")) s = s.substring(1);
        if (s.startsWith("docs/")) s = s.substring(5);
        if (s.startsWith("public/docs/")) s = s.substring(12);
        return s;
    }

    private File copyDocToCache(String cleanName) {
        try {
            File docsDir = new File(getCacheDir(), "docs");
            if (!docsDir.exists()) docsDir.mkdirs();
            File outFile = new File(docsDir, cleanName);

            // Copy from APK asset manager "public/docs/" + cleanName
            try (InputStream in = getAssets().open("public/docs/" + cleanName);
                 FileOutputStream out = new FileOutputStream(outFile)) {
                byte[] buf = new byte[8192];
                int len;
                while ((len = in.read(buf)) > 0) {
                    out.write(buf, 0, len);
                }
            }
            return outFile;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private boolean saveDocToDownloads(String cleanName, String displayName) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentResolver resolver = getContentResolver();
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.MediaColumns.DISPLAY_NAME, displayName);
                cv.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                if (uri != null) {
                    try (OutputStream out = resolver.openOutputStream(uri);
                         InputStream in = getAssets().open("public/docs/" + cleanName)) {
                        byte[] buf = new byte[8192];
                        int len;
                        while ((len = in.read(buf)) > 0) {
                            out.write(buf, 0, len);
                        }
                        return true;
                    }
                }
            } else {
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!dir.exists()) dir.mkdirs();
                File target = new File(dir, displayName);
                try (OutputStream out = new FileOutputStream(target);
                     InputStream in = getAssets().open("public/docs/" + cleanName)) {
                    byte[] buf = new byte[8192];
                    int len;
                    while ((len = in.read(buf)) > 0) {
                        out.write(buf, 0, len);
                    }
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Fully terminate the process when activity finishes/exits
        Process.killProcess(Process.myPid());
    }
}
