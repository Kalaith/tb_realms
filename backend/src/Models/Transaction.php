<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class Transaction extends Model
{
    protected $table = 'transactions';
    
    protected $fillable = [
        'user_id',
        'portfolio_id',
        'stock_id',
        'type',
        'quantity',
        'price_per_share',
        'total_amount',
        'fees',
        'status'
    ];
    
    protected $casts = [
        'quantity' => 'integer',
        'price_per_share' => 'decimal:4',
        'total_amount' => 'decimal:2',
        'fees' => 'decimal:2'
    ];

    /**
     * Create the transactions table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('transactions')) {
            Schema::schema()->create('transactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('portfolio_id');
                $table->unsignedBigInteger('stock_id');
                $table->enum('type', ['buy', 'sell']);
                $table->integer('quantity');
                $table->decimal('price_per_share', 10, 4);
                $table->decimal('total_amount', 15, 2);
                $table->decimal('fees', 8, 2)->default(0);
                $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
                $table->timestamps();
                
                // Foreign keys
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('portfolio_id')->references('id')->on('portfolios')->onDelete('cascade');
                $table->foreign('stock_id')->references('id')->on('stocks')->onDelete('cascade');
                
                // Indexes
                $table->index(['user_id', 'portfolio_id']);
                $table->index('stock_id');
                $table->index('type');
                $table->index('status');
                $table->index('created_at');
            });
            echo "✅ Transactions table created\n";
        }
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
