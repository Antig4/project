<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Faculty;

class FacultyController extends Controller
{
    public function index()
    {
        return response()->json(
            Faculty::where('is_archived', false)->with('department')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'department_id' => 'required|exists:departments,id',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $faculty = Faculty::create($validated);
        return response()->json($faculty);
    }

    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'department_id' => 'sometimes|required|exists:departments,id',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $faculty->update($validated);
        return response()->json($faculty);
    }

    //  Archive instead of delete
    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->is_archived = true;
        $faculty->save();

        return response()->json(['message' => 'Faculty archived successfully']);
    }
}
