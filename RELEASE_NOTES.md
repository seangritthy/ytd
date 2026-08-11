# YTD Video Downloader - Release Notes

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
