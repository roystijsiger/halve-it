#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
    const sourceSplash = path.join(context.opts.projectRoot, 'www/img/splash.png');
    
    const drawableDirs = [
        'app/src/main/res/drawable',
        'app/src/main/res/drawable-ldpi',
        'app/src/main/res/drawable-mdpi',
        'app/src/main/res/drawable-hdpi',
        'app/src/main/res/drawable-xhdpi',
        'app/src/main/res/drawable-xxhdpi',
        'app/src/main/res/drawable-xxxhdpi'
    ];
    
    if (fs.existsSync(platformRoot) && fs.existsSync(sourceSplash)) {
        // Copy splash to drawable folders
        drawableDirs.forEach(function(dir) {
            const targetDir = path.join(platformRoot, dir);
            const targetFile = path.join(targetDir, 'splash.png');
            
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            fs.copyFileSync(sourceSplash, targetFile);
            console.log('Copied splash.png to ' + targetFile);
        });
        
        // Create styles.xml
        const valuesDir = path.join(platformRoot, 'app/src/main/res/values');
        const stylesFile = path.join(valuesDir, 'styles.xml');
        
        if (!fs.existsSync(valuesDir)) {
            fs.mkdirSync(valuesDir, { recursive: true });
        }
        
        const stylesContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Splash Screen Theme -->
    <style name="AppTheme.SplashScreen" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowFullscreen">false</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>`;
        
        fs.writeFileSync(stylesFile, stylesContent);
        console.log('Created styles.xml');
        
        // Update AndroidManifest.xml
        const manifestFile = path.join(platformRoot, 'app/src/main/AndroidManifest.xml');
        if (fs.existsSync(manifestFile)) {
            let manifest = fs.readFileSync(manifestFile, 'utf8');
            
            // Replace android:theme
            manifest = manifest.replace(
                /android:theme="@android:style\/Theme\.[^"]*"/,
                'android:theme="@style/AppTheme.SplashScreen"'
            );
            
            fs.writeFileSync(manifestFile, manifest);
            console.log('Updated AndroidManifest.xml with splash theme');
        }
    }
};
