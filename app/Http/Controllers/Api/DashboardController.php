<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'activeStudents' => Student::where('status', 'Active')->where('is_archived', false)->count(),
            'facultyMembers' => Faculty::where('is_archived', false)->count(),
            'activeCourses' => Course::where('status', 'Active')->where('is_archived', false)->count(),
            'departments' => Department::where('is_archived', false)->count(),
        ];

        $recentStudents = Student::where('is_archived', false)
            ->with(['course', 'department'])
            ->orderBy('created_at', 'desc')
            ->limit(7)
            ->get();

        $courses = Course::where('is_archived', false)
            ->with('department')
            ->orderBy('created_at', 'desc')
            ->get();

        $currentAcademicYear = AcademicYear::whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->first();

        return response()->json([
            'stats' => $stats,
            'recentStudents' => $recentStudents,
            'courses' => $courses,
            'currentAcademicYear' => $currentAcademicYear
        ]);
    }
}
