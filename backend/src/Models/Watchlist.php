<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class Watchlist extends Model
{
    protected $table = 'watchlists';
    
    protected $fillable = [
        'user_id',
        'stock_id'
    ];
    
    protected $casts = [
        'user_id' => 'integer',
        'stock_id' => 'integer'
    ];

    /**
     * Create the watchlists table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('watchlists')) {
            Schema::schema()->create('watchlists', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('stock_id');
                $table->timestamps();
                
                // Foreign keys
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('stock_id')->references('id')->on('stocks')->onDelete('cascade');
                
                // Unique constraint to prevent duplicate entries
                $table->unique(['user_id', 'stock_id']);
                
                // Indexes
                $table->index('user_id');
                $table->index('stock_id');
            });
            echo "✅ Watchlists table created\n";
        }
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
