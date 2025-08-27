<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class UserSettings extends Model
{
    protected $table = 'user_settings';
    
    protected $fillable = [
        'user_id',
        'notifications_enabled',
        'email_notifications',
        'push_notifications',
        'trading_notifications',
        'achievement_notifications',
        'market_alerts',
        'theme_preference',
        'language',
        'timezone',
        'currency_display',
        'portfolio_privacy',
        'auto_invest_enabled',
        'risk_tolerance'
    ];
    
    protected $casts = [
        'notifications_enabled' => 'boolean',
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'trading_notifications' => 'boolean',
        'achievement_notifications' => 'boolean',
        'market_alerts' => 'boolean',
        'portfolio_privacy' => 'boolean',
        'auto_invest_enabled' => 'boolean'
    ];

    /**
     * Create the user_settings table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('user_settings')) {
            Schema::schema()->create('user_settings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->boolean('notifications_enabled')->default(true);
                $table->boolean('email_notifications')->default(true);
                $table->boolean('push_notifications')->default(true);
                $table->boolean('trading_notifications')->default(true);
                $table->boolean('achievement_notifications')->default(true);
                $table->boolean('market_alerts')->default(false);
                $table->enum('theme_preference', ['light', 'dark', 'auto'])->default('auto');
                $table->string('language', 5)->default('en');
                $table->string('timezone', 50)->default('UTC');
                $table->string('currency_display', 3)->default('USD');
                $table->enum('portfolio_privacy', ['public', 'friends', 'private'])->default('private');
                $table->boolean('auto_invest_enabled')->default(false);
                $table->enum('risk_tolerance', ['low', 'medium', 'high'])->default('medium');
                $table->timestamps();
                
                // Foreign key
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                
                // Unique constraint
                $table->unique('user_id');
                
                // Indexes
                $table->index('user_id');
                $table->index('theme_preference');
                $table->index('portfolio_privacy');
            });
            echo "✅ User settings table created\n";
        }
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
