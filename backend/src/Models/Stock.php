<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class Stock extends Model
{
    protected $table = 'stocks';
    
    protected $fillable = [
        'symbol',
        'name',
        'description',
        'guild',
        'category',
        'current_price',
        'previous_close',
        'day_change',
        'day_change_percentage',
        'market_cap',
        'volume',
        'avg_volume',
        'pe_ratio',
        'dividend_yield',
        'beta',
        'week_52_high',
        'week_52_low',
        'is_active',
        'last_updated'
    ];
    
    protected $casts = [
        'current_price' => 'decimal:4',
        'previous_close' => 'decimal:4',
        'day_change' => 'decimal:4',
        'day_change_percentage' => 'decimal:4',
        'market_cap' => 'integer',
        'volume' => 'integer',
        'avg_volume' => 'integer',
        'pe_ratio' => 'decimal:2',
        'dividend_yield' => 'decimal:4',
        'beta' => 'decimal:4',
        'week_52_high' => 'decimal:4',
        'week_52_low' => 'decimal:4',
        'is_active' => 'boolean',
        'last_updated' => 'datetime'
    ];

    /**
     * Create the stocks table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('stocks')) {
            Schema::schema()->create('stocks', function (Blueprint $table) {
                $table->id();
                $table->string('symbol')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('guild')->nullable();
                $table->string('category')->nullable();
                $table->decimal('current_price', 10, 4);
                $table->decimal('previous_close', 10, 4)->nullable();
                $table->decimal('day_change', 10, 4)->default(0);
                $table->decimal('day_change_percentage', 8, 4)->default(0);
                $table->bigInteger('market_cap')->nullable();
                $table->bigInteger('volume')->default(0);
                $table->bigInteger('avg_volume')->default(0);
                $table->decimal('pe_ratio', 8, 2)->nullable();
                $table->decimal('dividend_yield', 6, 4)->nullable();
                $table->decimal('beta', 6, 4)->nullable();
                $table->decimal('week_52_high', 10, 4)->nullable();
                $table->decimal('week_52_low', 10, 4)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_updated')->useCurrent();
                $table->timestamps();
                
                // Indexes
                $table->index('symbol');
                $table->index('guild');
                $table->index('category');
                $table->index('current_price');
                $table->index('is_active');
                $table->index('market_cap');
            });
            echo "✅ Stocks table created\n";
        }
    }

    /**
     * Relationships
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function priceHistory()
    {
        return $this->hasMany(StockPriceHistory::class);
    }

    public function portfolioHoldings()
    {
        return $this->hasMany(PortfolioHolding::class);
    }
}
