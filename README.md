Plugin to extract specific texts from a site.

Firefox is not fully implemented yet (main manifest pending in v2)

create the following config.sh


```
OLD_SITE=old_site_url
NEW_SITE=new_site_url
TEXT_ANCHOR=text_needle
```

Run `create-plugin-zip.sh` to create the plugin with latest code. No external dependencies needed.
To load extension to chrome, follow Step 2 at https://support.google.com/chrome/a/answer/2714278?hl=en

```
Step 2: Test the app or extension
As a developer, you can test your app or extension to make sure it works in Chrome browser or on a ChromeOS device.

Choose the type of test device you need:
Apps—Sign in to your Google Account on a Chrome device.
Extensions—Sign in to your Google Account on a Chrome device or Chrome browser on a Windows, Mac, or Linux computer.
Save the app or extension folder on your test device.
Go to chrome://extensions/.
At the top right, turn on Developer mode.
Click Load unpacked.
Find and select the app or extension folder.
Open a new tab in Chromeand thenclick Appsand thenclick the app or extension. Make sure it loads and works correctly.
If needed, make changes in the manifest.json file, host the app folder, and retest it. Repeat until the app or extension works correctly.
Troubleshoot problems with your app or extension using Chrome logs:

In Chrome, click Moreand thenMore toolsand thenDeveloper Tools.
Verify your information. For example, check for the correct the app ID and version number.
```