<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{
    public function index()
    {
        return response()->json(
            Student::where('is_archived', false)->with(['course', 'department'])->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'dob' => 'nullable|date',
            'enrollment_date' => 'nullable|date',
            'address' => 'nullable|string',
            'year_level' => 'required',
            'course_id' => 'required|exists:courses,id',
            'department_id' => 'required|exists:departments,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'status' => 'nullable|in:Active,Inactive,Graduated',
        ]);

        // Use only validated fields to prevent mass-assignment of unexpected columns
        $student = Student::create($validated);
        return response()->json($student);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'dob' => 'nullable|date',
            'enrollment_date' => 'nullable|date',
            'address' => 'nullable|string',
            'year_level' => 'sometimes|required',
            'course_id' => 'sometimes|required|exists:courses,id',
            'department_id' => 'sometimes|required|exists:departments,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'status' => 'nullable|in:Active,Inactive,Graduated',
        ]);

        $student->update($validated);
        return response()->json($student);
    }

    //  Archive instead of delete
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->is_archived = true;
        $student->save();

        return response()->json(['message' => 'Student archived successfully']);
    }
}
