<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Capsule\Manager as Schema;

class Achievement extends Model
{
    protected $table = 'achievements';
    
    protected $fillable = [
        'name',
        'description',
        'category',
        'type',
        'target_value',
        'reward_points',
        'reward_title',
        'icon_url',
        'is_active',
        'sort_order'
    ];
    
    protected $casts = [
        'target_value' => 'decimal:2',
        'reward_points' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Create the achievements table
     */
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('achievements')) {
            Schema::schema()->create('achievements', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description');
                $table->string('category'); // 'trading', 'portfolio', 'social', 'milestone'
                $table->enum('type', ['count', 'value', 'percentage', 'streak'])->default('count');
                $table->decimal('target_value', 15, 2);
                $table->integer('reward_points')->default(0);
                $table->string('reward_title')->nullable();
                $table->text('icon_url')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
                
                // Indexes
                $table->index('category');
                $table->index('type');
                $table->index('is_active');
                $table->index('sort_order');
            });
            echo "✅ Achievements table created\n";
        }
    }

    /**
     * Create the user_achievements pivot table
     */
    public static function createUserAchievementsTable()
    {
        if (!Schema::schema()->hasTable('user_achievements')) {
            Schema::schema()->create('user_achievements', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('achievement_id');
                $table->decimal('progress', 15, 2)->default(0);
                $table->boolean('is_earned')->default(false);
                $table->timestamp('earned_at')->nullable();
                $table->timestamps();
                
                // Foreign keys
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('achievement_id')->references('id')->on('achievements')->onDelete('cascade');
                
                // Unique constraint
                $table->unique(['user_id', 'achievement_id']);
                
                // Indexes
                $table->index('user_id');
                $table->index('achievement_id');
                $table->index('is_earned');
                $table->index('earned_at');
            });
            echo "✅ User achievements table created\n";
        }
    }

    /**
     * Relationships
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
                    ->withPivot(['progress', 'is_earned', 'earned_at'])
                    ->withTimestamps();
    }
}
