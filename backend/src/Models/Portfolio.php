<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class Portfolio extends Model
{
    protected $table = 'portfolios';
    
    protected $fillable = [
        'user_id',
        'cash_balance',
        'total_value',
        'total_invested',
        'total_profit_loss',
        'performance_percentage',
        'risk_level'
    ];
    
    protected $casts = [
        'cash_balance' => 'decimal:2',
        'total_value' => 'decimal:2',
        'total_invested' => 'decimal:2',
        'total_profit_loss' => 'decimal:2',
        'performance_percentage' => 'decimal:4'
    ];

    /**
     * Create the portfolios table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('portfolios')) {
            Schema::schema()->create('portfolios', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->decimal('cash_balance', 15, 2)->default(0);
                $table->decimal('total_value', 15, 2)->default(0);
                $table->decimal('total_invested', 15, 2)->default(0);
                $table->decimal('total_profit_loss', 15, 2)->default(0);
                $table->decimal('performance_percentage', 8, 4)->default(0);
                $table->enum('risk_level', ['conservative', 'moderate', 'aggressive'])->default('moderate');
                $table->timestamps();
                
                // Foreign key and indexes
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->index('user_id');
                $table->index('performance_percentage');
                $table->index('total_value');
            });
            echo "✅ Portfolios table created\n";
        }
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function holdings()
    {
        return $this->hasMany(PortfolioHolding::class);
    }
}
