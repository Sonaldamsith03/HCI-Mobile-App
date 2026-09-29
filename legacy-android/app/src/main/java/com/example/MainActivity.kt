package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.AppDatabase
import com.example.data.AppRepository
import com.example.ui.AgriConnectApp
import com.example.ui.MainViewModel
import com.example.ui.MainViewModelFactory
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    
    val database = AppDatabase.getDatabase(this)
    val repository = AppRepository(
        database.produceDao(),
        database.transactionDao(),
        database.messageDao()
    )

    setContent {
      MyApplicationTheme {
        val viewModel: MainViewModel = viewModel(factory = MainViewModelFactory(repository))
        AgriConnectApp(viewModel)
      }
    }
  }
}
