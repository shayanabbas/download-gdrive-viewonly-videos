# Google Drive Video/Audio Downloader Chrome Extension

This Chrome extension captures video and audio streams from Google Drive and downloads them directly with maximum quality.

## Setup

1. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this directory

## How it works

1. The extension intercepts network requests from Google Drive video player
2. It captures the largest video and audio streams (maximum quality)
3. When you click the extension icon, it downloads both files directly to your computer
4. Files are saved as `video.mp4` and `audio.mp4` (you can rename them when saving)

## Files

- `background.js` - Service worker that captures network requests and handles downloads
- `manifest.json` - Extension manifest

## Usage

1. Open a Google Drive video in your browser
2. Wait for the video to start playing (this allows the extension to capture the streams)
3. Click the extension icon
4. The browser will prompt you to save the video and audio files
5. Choose where to save them on your computer
6. Don't stop the video until video and audio files are downloaded

## Notes

- The extension captures the largest available streams for maximum quality
- Both video and audio files are downloaded separately
- You can merge them later using any video editing software if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by **Shayan Abbas**

- GitHub: [@shayanabbas](https://github.com/shayanabbas)
- LinkedIn: [shayanabbas](https://linkedin.com/in/shayanabbas)
- Support: [Buy me a coffee](https://paypal.me/hishayan)

If you use this software, please include attribution to the original author.

