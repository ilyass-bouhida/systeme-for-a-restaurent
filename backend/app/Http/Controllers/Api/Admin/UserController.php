<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(private readonly ActivityService $activity) {}

    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(
            User::query()->with(['roles', 'permissions'])->orderBy('name')->paginate(30),
        );
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $data = $request->validated();
        $role = Arr::pull($data, 'role');
        $permissions = Arr::pull($data, 'permissions', []);
        unset($data['password_confirmation']);

        $user = User::query()->create($data);
        $user->syncRoles([$role]);
        if ($role === 'worker') {
            $user->syncPermissions($permissions);
        }
        $this->activity->record($request->user(), 'user.created', $user);

        return new UserResource($user);
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $data = $request->validated();
        $role = Arr::pull($data, 'role');
        $permissions = Arr::pull($data, 'permissions');
        unset($data['password_confirmation']);

        if (($data['is_active'] ?? true) === false && $request->user()->is($user)) {
            throw ValidationException::withMessages([
                'is_active' => 'You cannot deactivate your own account.',
            ]);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);
        if ($role) {
            $user->syncRoles([$role]);
        }
        if (is_array($permissions) && ! $user->hasRole('admin')) {
            $user->syncPermissions($permissions);
        }
        if (($data['is_active'] ?? true) === false) {
            $user->tokens()->delete();
        }
        $this->activity->record($request->user(), 'user.updated', $user);

        return new UserResource($user->refresh());
    }

    public function destroy(User $user, Request $request): JsonResponse
    {
        if ($request->user()->is($user)) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete your own account.',
            ]);
        }

        $user->tokens()->delete();
        $user->delete();
        $this->activity->record($request->user(), 'user.deleted', $user);

        return response()->json(status: 204);
    }
}
