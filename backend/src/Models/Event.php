<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class Event extends Model
{
    protected $table = 'market_events';
    
    protected $fillable = [
        'title',
        'description',
        'event_type',
        'severity',
        'affected_sectors',
        'affected_stocks',
        'impact_percentage',
        'duration_minutes',
        'is_active',
        'starts_at',
        'ends_at'
    ];
    
    protected $casts = [
        'affected_sectors' => 'array',
        'affected_stocks' => 'array',
        'impact_percentage' => 'decimal:4',
        'duration_minutes' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime'
    ];

    /**
     * Create the market_events table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('market_events')) {
            Schema::schema()->create('market_events', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description');
                $table->enum('event_type', ['market_crash', 'bull_run', 'sector_boom', 'economic_news', 'company_news', 'natural_disaster']);
                $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
                $table->json('affected_sectors')->nullable(); // JSON array of sector names
                $table->json('affected_stocks')->nullable(); // JSON array of stock IDs
                $table->decimal('impact_percentage', 8, 4)->default(0); // Positive or negative impact
                $table->integer('duration_minutes')->default(60);
                $table->boolean('is_active')->default(true);
                $table->timestamp('starts_at');
                $table->timestamp('ends_at');
                $table->timestamps();
                
                // Indexes
                $table->index('event_type');
                $table->index('severity');
                $table->index('is_active');
                $table->index('starts_at');
                $table->index('ends_at');
                $table->index(['starts_at', 'ends_at']);
            });
            echo "✅ Market events table created\n";
        }
    }

    /**
     * Relationships
     */
    public function stocks()
    {
        // This would need to be handled via the affected_stocks JSON field
        // or create a separate pivot table if more complex relationships are needed
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('starts_at', '<=', now())
                    ->where('ends_at', '>=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('is_active', true)
                    ->where('starts_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('ends_at', '<', now());
    }
}
