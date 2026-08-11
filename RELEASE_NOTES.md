# YTD Video Downloader - Release Notes

## Version 1.0.12
- **Fixed HTML / 0 Bytes Error Reporting**: Resolved 0 bytes reporting bug by capturing true file size before deletion and rejecting `text/html` responses.
- **Web Sniffer HTML Fallback**: Automatically prompts user to load video link in built-in Web Sniffer when non-direct media pages are returned.
- **Clean UI Toast Error Messages**: Standardized error string formatting in `DownloadService.java` and `assets/app.js`.

## Version 1.0.11
- **Fixed Fake / Truncated 600KB Downloads**: Fixed URL target selection in `DownloadService.java` so `yt-dlp` receives original video page URLs instead of direct expiring stream links.
- **Strict Stream Validation**: Rejects incomplete or truncated video files (< 1MB) and automatically cleans up partial downloads.
- **Page URL Bridge Sync**: Added `pageUrl` passing across JavaScript bridge, `MainActivity.java`, and `DownloadService.java`.

## Version 1.0.10
- **Playlist & Batch Link Recognition**: Added playlist and channel link parsing support (`playlist?list=`, `/shorts/`, `/live/`) in `VideoExtractor.java`.
- **Enhanced Media Extractor**: Expanded multi-site support for Vimeo, Dailymotion, TikTok, Instagram Reels, and Twitter/X streams.
- **Version Sync v1.0.10**: Updated version numbers across app manifest, activity bridge, and build scripts.

## Version 1.0.9
- **High-Speed Stream Buffer**: Upgraded stream download buffer to 16KB in `DownloadService.java` for faster download throughput on large video files.
- **Improved YouTube Stream Extractor**: Optimized format prioritization in `VideoExtractor.java` to favor combined audio/video streams and clean quality labels.
- **Version Sync v1.0.9**: Updated version string across manifest, Java bridge, build scripts, and GitHub releases.

## Version 1.0.8
- **Enhanced In-App Package Installer & ContentProvider**: Implemented OpenableColumns query interface in `YtdFileProvider.java` for seamless Android PackageInstaller compatibility.
- **HTTP 301/302 Redirect Loop Engine**: Added multi-redirect handling in `DownloadService.java` to support GitHub release CDN links (`objects.githubusercontent.com`).
- **Updater & Version Sync v1.0.8**: Updated version tracking in `AndroidManifest.xml`, `MainActivity.java`, and `assets/app.js` for instant 1-click updates.

## Version 1.0.7
- **High-Speed Native Downloader Engine**: Integrated native background `yt-dlp` downloader into `DownloadService.java` for high-speed multi-threaded video downloads (300MB+ movies).
- **HTTP Error & Fake File Rejection**: Automatically rejects HTTP 403 / 400 error HTML pages (~1.1 MB) and deletes invalid stream files.
- **Live Progress & Speed Metrics**: Displays real-time download percentage, transfer speed (MB/s), and true file size in active downloads.

## Version 1.0.6
- **Fixed Update APK File Extension**: Corrected `DownloadService` file extension selection so update installers save as `.apk` files instead of `.mp4`.
- **Unknown Sources Permission Handler**: Automatically opens Android `ACTION_MANAGE_UNKNOWN_APP_SOURCES` settings screen if unknown sources permission is needed for installation.
- **Reliable In-App Installer Launch**: `onDownloadComplete` automatically launches the package installer as soon as update downloads finish.

## Version 1.0.5
- **Fixed HTML5 Media Playback Error**: Added `localfile` scheme stream interceptor in `MainActivity.java` to bypass Android WebView file origin restrictions.
- **Automatic Player Fallback**: In-app media player automatically delegates to external system player if video playback encounters unsupported codecs.
- **Stream Headers**: Added `Access-Control-Allow-Origin` and `Accept-Ranges` bytes headers for smooth video seeking and playback.

## Version 1.0.4
- **Auto-Update Installer**: Built-in 1-click update checker and installer that automatically detects new releases on GitHub, downloads `ytd.apk`, and launches the Android Package Installer.
- **Dynamic App Version Sync**: Web UI Settings tab dynamically syncs and displays the exact installed version (`v1.0.4 Pro Edition`).
- **REQUEST_INSTALL_PACKAGES Permission**: Added Android package installer permission for seamless in-app updating.

## Version 1.0.3
- **Integrated yt-dlp Extraction Engine**: Full support for YouTube live streams (`/live/`), Shorts (`/shorts/`), Facebook, TikTok, Instagram, Twitter/X, and multi-site video streams.
- **Fixed Fake File Downloads**: Resolves small 1.2MB image downloads on YouTube live links by fetching real `.googlevideo.com` media streams (up to 370MB+).
- **Exact Metadata & Real File Sizes**: Displays exact video titles, real thumbnails, and accurate stream file sizes before downloading.

## Version 1.0.2
- **In-App Media Player**: Built-in full-screen video and audio player modal directly in the app (plays any downloaded file instantly without needing external apps).
- **YtdFileProvider Integration**: Added ContentProvider URI support and read permissions for external player apps.

## Version 1.0.1
- **Enhanced Stream Extractor Engine**: Automatic URL scheme normalization and guaranteed non-empty format stream extraction.
- **Improved Compatibility**: Reliable fallback stream generation for YouTube, Facebook, TikTok, Instagram, Twitter/X, and custom links.
- **Stability Fixes**: Resolved URL parsing errors for incomplete or non-prefixed video links.

## Version 1.0.0 (Initial Release)
- **Multi-Platform Video Downloader**: Support for YouTube, Facebook, TikTok, Instagram, Twitter/X, Vimeo, Dailymotion, and general video sites.
- **Web Sniffer Browser**: Integrated browser that automatically sniffs media streams (MP4, M3U8, WEBM, FLV) while browsing.
- **Format & Quality Selection**: Options for 1080p Full HD, 720p HD, 480p SD, and MP3 audio extraction.
- **Native Background Downloader**: Multi-threaded downloader supporting pause/resume, notification progress, and media scanner registration.
- **Modern Sleek UI**: Dark mode dashboard with visual platform cards, paste clipboard shortcut, live speed metrics, and responsive layout.
