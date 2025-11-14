<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Department;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('department')
            ->where('is_archived', false); //  only show active courses

        // Optional filters
        if ($request->has('search') && $request->search !== '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('department') && $request->department !== 'All Departments') {
            $query->where('department_id', $request->department);
        }

        if ($request->has('status') && $request->status !== 'All Status') {
            $query->where('status', $request->status);
        }

        //  Always return both arrays to avoid undefined
        return response()->json([
            'courses' => $query->get(),
            'departments' => Department::where('is_archived', false)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'status' => 'required|string'
        ]);

        $course = Course::create($validated);
        return response()->json($course, 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'status' => 'required|string'
        ]);

        $course->update($validated);
        return response()->json($course);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->is_archived = true;
        $course->save();

        return response()->json(['message' => 'Course archived successfully']);
    }
}
