package com.example.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import kotlinx.coroutines.flow.Flow

@Dao
interface ProduceDao {
    @Query("SELECT * FROM produce_table ORDER BY id DESC")
    fun getAllProduce(): Flow<List<ProduceEntity>>

    @Query("SELECT COUNT(*) FROM produce_table")
    suspend fun getCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduce(produce: ProduceEntity)

    @Update
    suspend fun updateProduce(produce: ProduceEntity)

    @Query("DELETE FROM produce_table WHERE id = :id")
    suspend fun deleteProduceById(id: Int)

    @Query("DELETE FROM produce_table")
    suspend fun clearAll()
}
