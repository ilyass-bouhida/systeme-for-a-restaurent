<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\ActivityService;

class ProfileController extends Controller
{
    public function __construct(private readonly ActivityService $activity) {}

    public function update(UpdateProfileRequest $request): UserResource
    {
        $data = $request->validated();
        unset($data['current_password'], $data['password_confirmation']);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user = $request->user();
        $user->update($data);
        $this->activity->record($user, 'profile.updated', $user);

        return new UserResource($user->refresh());
    }
}
