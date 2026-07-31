<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityService
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function record(
        ?User $actor,
        string $action,
        ?Model $subject = null,
        array $metadata = [],
    ): ActivityLog {
        return ActivityLog::query()->create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'metadata' => $metadata ?: null,
            'created_at' => now(),
        ]);
    }
}
