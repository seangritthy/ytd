package com.ytd.downloader;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Environment;
import android.webkit.MimeTypeMap;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DownloadService {

    private Context context;
    private ExecutorService executor = Executors.newFixedThreadPool(4);
    private File downloadDir;

    public interface DownloadListener {
        void onProgress(String downloadId, int progress, long bytesDownloaded, long totalBytes, String status);
        void onComplete(String downloadId, String filePath);
        void onError(String downloadId, String error);
    }

    public DownloadService(Context context) {
        this.context = context;
        downloadDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "YTD");
        if (!downloadDir.exists()) {
            downloadDir.mkdirs();
        }
    }

    public void startDownload(final String downloadId, final String videoUrl, final String title, final String format, final DownloadListener listener) {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    String sanitizedTitle = title.replaceAll("[^a-zA-Z0-9._-]", "_");
                    if (sanitizedTitle.length() > 50) sanitizedTitle = sanitizedTitle.substring(0, 50);
                    
                    String ext = "mp4";
                    if ("apk".equalsIgnoreCase(format) || title.toLowerCase().endsWith(".apk") || videoUrl.toLowerCase().contains(".apk")) {
                        ext = "apk";
                    } else if ("mp3".equalsIgnoreCase(format) || title.toLowerCase().contains("mp3")) {
                        ext = "mp3";
                    } else if (videoUrl.contains(".m3u8")) {
                        ext = "m3u8";
                    }

                    File outputFile = new File(downloadDir, sanitizedTitle + "_" + System.currentTimeMillis() + "." + ext);
                    
                    // Fallback to DownloadManager for standard URLs if system permits
                    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
                        downloadWithURLConnection(downloadId, videoUrl, outputFile, listener);
                    } else {
                        listener.onError(downloadId, "Invalid media URL scheme");
                    }
                } catch (Exception e) {
                    listener.onError(downloadId, e.getMessage());
                }
            }
        });
    }

    private void downloadWithURLConnection(String downloadId, String videoUrl, File outputFile, DownloadListener listener) {
        InputStream input = null;
        FileOutputStream output = null;
        HttpURLConnection connection = null;

        try {
            URL url = new URL(videoUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(30000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            connection.connect();

            int fileLength = connection.getContentLength();
            input = connection.getInputStream();
            output = new FileOutputStream(outputFile);

            byte[] buffer = new byte[8192];
            long total = 0;
            int count;
            long lastUpdate = System.currentTimeMillis();

            while ((count = input.read(buffer)) != -1) {
                total += count;
                output.write(buffer, 0, count);

                long now = System.currentTimeMillis();
                if (now - lastUpdate > 300) { // Update UI every 300ms
                    lastUpdate = now;
                    int progress = fileLength > 0 ? (int) (total * 100 / fileLength) : 0;
                    listener.onProgress(downloadId, progress, total, fileLength, "Downloading");
                }
            }

            output.flush();
            output.close();
            input.close();

            // Scan media file so it shows in Gallery / Music Player
            MediaScannerConnection.scanFile(context, new String[]{outputFile.getAbsolutePath()}, null, null);

            listener.onComplete(downloadId, outputFile.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
            listener.onError(downloadId, "Download failed: " + e.getMessage());
        } finally {
            try {
                if (output != null) output.close();
                if (input != null) input.close();
            } catch (Exception ignored) {}
            if (connection != null) connection.disconnect();
        }
    }

    public JSONArray getDownloadedFiles() {
        JSONArray array = new JSONArray();
        try {
            if (downloadDir != null && downloadDir.exists()) {
                File[] files = downloadDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isFile()) {
                            JSONObject item = new JSONObject();
                            item.put("name", file.getName());
                            item.put("path", file.getAbsolutePath());
                            item.put("size", formatFileSize(file.length()));
                            item.put("lastModified", file.lastModified());
                            item.put("isAudio", file.getName().endsWith(".mp3"));
                            array.put(item);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return array;
    }

    public boolean deleteFile(String path) {
        try {
            File f = new File(path);
            if (f.exists()) {
                return f.delete();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public void openFile(String path) {
        try {
            File file = new File(path);
            if (!file.exists()) {
                Toast.makeText(context, "File does not exist: " + path, Toast.LENGTH_SHORT).show();
                return;
            }

            if (path.endsWith(".apk")) {
                installApk(path);
                return;
            }

            Uri contentUri = Uri.parse("content://com.ytd.downloader.fileprovider" + file.getAbsolutePath());
            String mimeType = file.getName().toLowerCase().endsWith(".mp3") ? "audio/*" : "video/*";

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(context, "Cannot open file externally: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    public void installApk(String path) {
        try {
            File file = new File(path);
            if (!file.exists()) {
                Toast.makeText(context, "APK file not found: " + path, Toast.LENGTH_SHORT).show();
                return;
            }

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                if (!context.getPackageManager().canRequestPackageInstalls()) {
                    Toast.makeText(context, "Please enable unknown app sources permission for YTD Pro", Toast.LENGTH_LONG).show();
                    Intent settingsIntent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    settingsIntent.setData(Uri.parse("package:" + context.getPackageName()));
                    settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(settingsIntent);
                    return;
                }
            }

            Uri apkUri = Uri.parse("content://com.ytd.downloader.fileprovider" + file.getAbsolutePath());
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(context, "Failed to launch installer: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}
