<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;

class SettingsController extends Controller
{
    //  Show active records
    public function index()
    {
        return response()->json([
            'departments' => Department::where('is_archived', false)->get(),
            'academicYears' => AcademicYear::where('is_archived', false)->orderBy('start_date', 'desc')->get(),
        ]);
    }

    //  Store Department
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate(['name' => 'required']);
        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    //  Update Department
    public function updateDepartment(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $validated = $request->validate(['name' => 'required']);
        $department->update($validated);
        return response()->json($department);
    }

    //  Archive Department
    public function destroyDepartment($id)
    {
        $department = Department::findOrFail($id);
        $department->is_archived = true;
        $department->save();
        return response()->json(['message' => 'Department archived successfully']);
    }

    //  Store Academic Year
    public function storeAcademicYear(Request $request)
    {
        $validated = $request->validate([
            'period' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);
        $academicYear = AcademicYear::create($validated);
        return response()->json($academicYear, 201);
    }

    //  Update Academic Year
    public function updateAcademicYear(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $validated = $request->validate([
            'period' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);
        $academicYear->update($validated);
        return response()->json($academicYear);
    }

    //  Archive Academic Year
    public function destroyAcademicYear($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYear->is_archived = true;
        $academicYear->save();
        return response()->json(['message' => 'Academic year archived successfully']);
    }

    // =====================
    //  Archive Section
    // =====================
    public function archive()
    {
        $archives = collect();

        // Students (include course, department, student_id, year_level)
        $students = Student::where('is_archived', true)->with(['course', 'department'])->get();
        foreach ($students as $s) {
            $archives->push([
                'id' => $s->id,
                'type' => 'student',
                'student_id' => $s->student_id,
                'name' => $s->name,
                'year_level' => $s->year_level,
                'course' => $s->course ? $s->course->name : null,
                'department' => $s->department ? $s->department->name : null,
                'archived_at' => $s->updated_at,
            ]);
        }

        // Faculty (include faculty_id and department)
        $faculty = Faculty::where('is_archived', true)->with('department')->get();
        foreach ($faculty as $f) {
            $archives->push([
                'id' => $f->id,
                'type' => 'faculty',
                'faculty_id' => $f->faculty_id,
                'name' => $f->name,
                'department' => $f->department ? $f->department->name : null,
                'archived_at' => $f->updated_at,
            ]);
        }

        // Courses (include department and status)
        $courses = Course::where('is_archived', true)->with('department')->get();
        foreach ($courses as $c) {
            $archives->push([
                'id' => $c->id,
                'type' => 'course',
                'name' => $c->name,
                'department' => $c->department ? $c->department->name : null,
                'status' => $c->status,
                'archived_at' => $c->updated_at,
            ]);
        }

        // Departments
        $departments = Department::where('is_archived', true)->get();
        foreach ($departments as $d) {
            $archives->push([
                'id' => $d->id,
                'type' => 'department',
                'name' => $d->name,
                'archived_at' => $d->updated_at,
            ]);
        }

        // Academic Years (include period, start_date, end_date)
        $years = AcademicYear::where('is_archived', true)->get();
        foreach ($years as $y) {
            $archives->push([
                'id' => $y->id,
                'type' => 'academic_year',
                'period' => $y->period,
                'start_date' => $y->start_date,
                'end_date' => $y->end_date,
                'archived_at' => $y->updated_at,
            ]);
        }

        return response()->json($archives);
    }

    //  Restore archived record
public function restore($type, $id)
{
    $model = $this->getModel($type);
    if (!$model) {
        return response()->json(['error' => 'Invalid type'], 400);
    }

    $record = $model::find($id);
    if (!$record) {
        return response()->json(['error' => 'Record not found'], 404);
    }

    // Check if record has is_archived column
    if (!array_key_exists('is_archived', $record->getAttributes())) {
        return response()->json(['error' => 'Model missing is_archived column'], 500);
    }

    $record->is_archived = false;
    $record->save();

    return response()->json(['message' => ucfirst($type) . ' restored successfully']);
}

//  Delete archived permanently
public function deletePermanent($type, $id)
{
    $model = $this->getModel($type);
    if (!$model) {
        return response()->json(['error' => 'Invalid type'], 400);
    }

    $record = $model::find($id);
    if (!$record) {
        return response()->json(['error' => 'Record not found'], 404);
    }

    $record->delete();

    return response()->json(['message' => ucfirst($type) . ' deleted permanently']);
}


    // =====================
    //  Helper function to map type string → model class
    // =====================
    private function getModel($type)
    {
        switch ($type) {
            case 'student':
                return Student::class;
            case 'faculty':
                return Faculty::class;
            case 'course':
                return Course::class;
            case 'department':
                return Department::class;
            case 'academic_year':
                return AcademicYear::class;
            default:
                return null;
        }
    }
}
