package com.leadmangament

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    
    // 🔔 Create notification channels for Android 8+
    createNotificationChannels()
  }
  
  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(NotificationManager::class.java)
      
      // Create default notification channel
      val defaultChannel = NotificationChannel(
        "default",
        "Default Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Default notification channel for all notifications"
        enableVibration(true)
        enableLights(true)
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(defaultChannel)
      
      // Create high priority channel
      val highChannel = NotificationChannel(
        "high",
        "High Priority Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "High priority notifications"
        enableVibration(true)
        enableLights(true)
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(highChannel)
      
      // Create lead reminder channel
      val leadChannel = NotificationChannel(
        "lead_reminders",
        "Lead Reminders",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notifications for lead follow-up reminders"
        enableVibration(true)
        enableLights(true)
        setShowBadge(true)
      }
      notificationManager.createNotificationChannel(leadChannel)
    }
  }
}

