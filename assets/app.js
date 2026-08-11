(function() {
  'use strict';

  // Global State
  let currentVideoData = null;
  let selectedFormatIndex = 0;
  let activeDownloads = {};
  let sniffedMediaUrl = null;

  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pasteBtn = document.getElementById('paste-btn');
  const urlInput = document.getElementById('url-input');
  const clearUrlBtn = document.getElementById('clear-url-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  const videoResultCard = document.getElementById('video-result');
  const resThumb = document.getElementById('res-thumb');
  const resPlatform = document.getElementById('res-platform');
  const resTitle = document.getElementById('res-title');
  const resUrl = document.getElementById('res-url');
  const formatOptionsContainer = document.getElementById('format-options');
  const startDlBtn = document.getElementById('start-dl-btn');
  const activeDownloadsContainer = document.getElementById('active-downloads');
  const emptyActiveDl = document.getElementById('empty-active-dl');
  const downloadsListContainer = document.getElementById('downloads-list');
  const refreshFilesBtn = document.getElementById('refresh-files-btn');
  const filesSearchInput = document.getElementById('files-search');

  // Browser Elements
  const browserUrlInput = document.getElementById('browser-url-input');
  const browserGoBtn = document.getElementById('browser-go-btn');
  const snifferBadge = document.getElementById('sniffer-badge');
  const sniffDlBtn = document.getElementById('sniff-dl-btn');

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupInputEvents();
    setupPlatformCards();
    loadFilesList();

    // Check Clipboard on startup
    if (window.AndroidBridge && window.AndroidBridge.getClipboardText) {
      const clipText = window.AndroidBridge.getClipboardText();
      if (clipText && (clipText.startsWith('http://') || clipText.startsWith('https://'))) {
        urlInput.value = clipText;
        clearUrlBtn.style.display = 'block';
      }
    }
  });

  // Tab Navigation
  function setupTabNavigation() {
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        navItems.forEach(nav => nav.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        item.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        if (targetTab === 'tab-files') {
          loadFilesList();
        }
      });
    });
  }

  // Input & Clipboard handling
  function setupInputEvents() {
    urlInput.addEventListener('input', () => {
      clearUrlBtn.style.display = urlInput.value ? 'block' : 'none';
    });

    clearUrlBtn.addEventListener('click', () => {
      urlInput.value = '';
      clearUrlBtn.style.display = 'none';
      videoResultCard.style.display = 'none';
    });

    pasteBtn.addEventListener('click', () => {
      if (window.AndroidBridge && window.AndroidBridge.getClipboardText) {
        const text = window.AndroidBridge.getClipboardText();
        if (text) {
          urlInput.value = text;
          clearUrlBtn.style.display = 'block';
          triggerAnalyze();
        } else {
          showToast("Clipboard is empty");
        }
      }
    });

    analyzeBtn.addEventListener('click', triggerAnalyze);

    startDlBtn.addEventListener('click', () => {
      if (!currentVideoData || !currentVideoData.formats || !currentVideoData.formats[selectedFormatIndex]) {
        showToast("Please select a video format");
        return;
      }

      const selectedFmt = currentVideoData.formats[selectedFormatIndex];
      const videoUrl = selectedFmt.url;
      const title = currentVideoData.title || "Video";
      const format = selectedFmt.type || "mp4";

      if (window.AndroidBridge && window.AndroidBridge.startDownload) {
        window.AndroidBridge.startDownload(videoUrl, title, format);
        showToast("Download Started!");
        videoResultCard.style.display = 'none';
        urlInput.value = '';
        clearUrlBtn.style.display = 'none';
      } else {
        showToast("Simulating Download for " + title);
      }
    });
  }

  function triggerAnalyze() {
    const url = urlInput.value.trim();
    if (!url) {
      showToast("Please enter or paste a video URL");
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Analyzing...";

    if (window.AndroidBridge && window.AndroidBridge.parseUrl) {
      window.AndroidBridge.parseUrl(url);
    } else {
      // Offline fallback mock
      setTimeout(() => {
        window.onParseResult({
          title: "Demo Video Sample",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          sourceUrl: url,
          platform: "YouTube",
          formats: [
            { quality: "1080p Full HD (MP4)", url: url, type: "mp4", size: "~35 MB" },
            { quality: "720p HD (MP4)", url: url, type: "mp4", size: "~18 MB" },
            { quality: "MP3 Audio (192kbps)", url: url, type: "mp3", size: "~4.2 MB" }
          ]
        });
      }, 1000);
    }
  }

  // Platform Grid Shortcuts
  function setupPlatformCards() {
    const cards = document.querySelectorAll('.platform-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const platformUrl = card.getAttribute('data-url');
        // Switch to Browser tab & load url
        document.querySelector('[data-tab="tab-browser"]').click();
        browserUrlInput.value = platformUrl;
        if (window.AndroidBridge && window.AndroidBridge.loadSnifferUrl) {
          window.AndroidBridge.loadSnifferUrl(platformUrl);
        }
      });
    });

    if (browserGoBtn) {
      browserGoBtn.addEventListener('click', () => {
        let u = browserUrlInput.value.trim();
        if (!u.startsWith('http://') && !u.startsWith('https://')) {
          u = 'https://' + u;
        }
        if (window.AndroidBridge && window.AndroidBridge.loadSnifferUrl) {
          window.AndroidBridge.loadSnifferUrl(u);
        }
      });
    }

    if (sniffDlBtn) {
      sniffDlBtn.addEventListener('click', () => {
        if (sniffedMediaUrl) {
          document.querySelector('[data-tab="tab-downloader"]').click();
          urlInput.value = sniffedMediaUrl;
          clearUrlBtn.style.display = 'block';
          triggerAnalyze();
        }
      });
    }

    if (refreshFilesBtn) {
      refreshFilesBtn.addEventListener('click', loadFilesList);
    }

    if (filesSearchInput) {
      filesSearchInput.addEventListener('input', () => {
        const q = filesSearchInput.value.toLowerCase();
        const items = downloadsListContainer.querySelectorAll('.file-item');
        items.forEach(it => {
          const name = it.querySelector('.file-name').innerText.toLowerCase();
          it.style.display = name.includes(q) ? 'flex' : 'none';
        });
      });
    }
  }

  // Android Bridge Window Callbacks
  window.onParseResult = function(data) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = `<span>Fetch Video</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

    if (!data || !data.formats || data.formats.length === 0) {
      showToast("Could not parse video streams for this link");
      return;
    }

    currentVideoData = data;
    selectedFormatIndex = 0;

    resThumb.src = data.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300';
    resPlatform.innerText = data.platform || 'Video';
    resTitle.innerText = data.title || 'Parsed Video';
    resUrl.innerText = data.sourceUrl || '';

    // Build format list
    formatOptionsContainer.innerHTML = '';
    data.formats.forEach((fmt, idx) => {
      const item = document.createElement('div');
      item.className = 'format-item' + (idx === 0 ? ' selected' : '');
      item.innerHTML = `
        <div class="f-title">${fmt.quality}</div>
        <div class="f-size">${fmt.size || 'Auto'}</div>
      `;
      item.addEventListener('click', () => {
        document.querySelectorAll('.format-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        selectedFormatIndex = idx;
      });
      formatOptionsContainer.appendChild(item);
    });

    videoResultCard.style.display = 'block';
  };

  window.onSharedUrlReceived = function(url) {
    urlInput.value = url;
    clearUrlBtn.style.display = 'block';
    triggerAnalyze();
  };

  window.onMediaSniffed = function(mediaUrl) {
    sniffedMediaUrl = mediaUrl;
    snifferBadge.style.display = 'flex';
  };

  window.onDownloadProgress = function(id, progress, bytesDownloaded, totalBytes, status) {
    emptyActiveDl.style.display = 'none';
    let card = document.getElementById('dl-' + id);
    if (!card) {
      card = document.createElement('div');
      card.id = 'dl-' + id;
      card.className = 'dl-item';
      activeDownloadsContainer.appendChild(card);
    }

    const mbDl = (bytesDownloaded / (1024 * 1024)).toFixed(1);
    const mbTotal = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : '?';

    card.innerHTML = `
      <div class="dl-header">
        <span>Downloading Video (${progress}%)</span>
        <span>${mbDl} / ${mbTotal} MB</span>
      </div>
      <div class="dl-progress-bg">
        <div class="dl-progress-fill" style="width: ${progress}%;"></div>
      </div>
      <div class="dl-meta">
        <span>Status: ${status}</span>
        <span>${progress < 100 ? 'Active' : 'Finished'}</span>
      </div>
    `;
  };

  window.onDownloadComplete = function(id, filePath) {
    const card = document.getElementById('dl-' + id);
    if (card) {
      card.remove();
    }
    if (activeDownloadsContainer.children.length <= 1) {
      emptyActiveDl.style.display = 'block';
    }
    loadFilesList();
  };

  window.onDownloadError = function(id, error) {
    const card = document.getElementById('dl-' + id);
    if (card) {
      card.innerHTML = `<div class="dl-header" style="color:#EF4444;">Download Failed: ${error}</div>`;
    }
  };

  // Files tab loader
  function loadFilesList() {
    if (window.AndroidBridge && window.AndroidBridge.getDownloadedFiles) {
      try {
        const jsonStr = window.AndroidBridge.getDownloadedFiles();
        const files = JSON.parse(jsonStr);
        renderFilesList(files);
      } catch (e) {
        renderFilesList([]);
      }
    } else {
      renderFilesList([
        { name: "Sample_Video_1080p.mp4", path: "/sdcard/Download/YTD/Sample_1080p.mp4", size: "24.5 MB", isAudio: false },
        { name: "Favorite_Music_Track.mp3", path: "/sdcard/Download/YTD/Music.mp3", size: "4.2 MB", isAudio: true }
      ]);
    }
  }

  function renderFilesList(files) {
    downloadsListContainer.innerHTML = '';
    if (!files || files.length === 0) {
      downloadsListContainer.innerHTML = '<div class="empty-state"><p>No downloaded files found.</p></div>';
      return;
    }

    files.forEach(f => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <div class="file-info">
          <div class="file-icon">${f.isAudio ? '🎵' : '🎬'}</div>
          <div class="file-details">
            <div class="file-name">${f.name}</div>
            <div class="file-meta">${f.size}</div>
          </div>
        </div>
        <div class="file-actions">
          <button class="f-act-btn play-btn">Play</button>
          <button class="f-act-btn del del-btn">Delete</button>
        </div>
      `;

      item.querySelector('.play-btn').addEventListener('click', () => {
        if (window.AndroidBridge && window.AndroidBridge.openFile) {
          window.AndroidBridge.openFile(f.path);
        } else {
          showToast("Playing: " + f.name);
        }
      });

      item.querySelector('.del-btn').addEventListener('click', () => {
        if (window.AndroidBridge && window.AndroidBridge.deleteFile) {
          window.AndroidBridge.deleteFile(f.path);
          loadFilesList();
          showToast("File deleted");
        } else {
          item.remove();
          showToast("Deleted " + f.name);
        }
      });

      downloadsListContainer.appendChild(item);
    });
  }

  function showToast(msg) {
    if (window.AndroidBridge && window.AndroidBridge.showToast) {
      window.AndroidBridge.showToast(msg);
    } else {
      alert(msg);
    }
  }

})();
