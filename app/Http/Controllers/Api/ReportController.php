<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $reportType = $request->get('type', 'Student Report');
        
        if ($reportType === 'Faculty Report') {
            // Faculty Report
            $query = Faculty::with('department');

            if ($request->has('department') && $request->department != 'All Departments') {
                $query->where('department_id', $request->department);
            }

            $faculty = $query->get();
            $departments = Department::all();

            $stats = [
                'totalFaculty' => Faculty::count(),
                'activeFaculty' => Faculty::count(),
                'departments' => Department::count()
            ];

            return response()->json([
                'faculty' => $faculty,
                'departments' => $departments,
                'stats' => $stats
            ]);
        } else {
            // Student Report
            $query = Student::with(['course', 'department']);

            if ($request->has('course') && $request->course != 'All Courses') {
                $query->where('course_id', $request->course);
            }

            $students = $query->get();
            $courses = Course::all();

            $stats = [
                'totalStudents' => Student::count(),
                'activeStudents' => Student::where('status', 'Active')->count(),
                'graduatedStudents' => Student::where('status', 'Graduated')->count()
            ];

            return response()->json([
                'students' => $students,
                'courses' => $courses,
                'stats' => $stats
            ]);
        }
    }

    // Export CSV for students or faculty
    public function export(Request $request)
    {
        $type = $request->get('type', 'students');

        if ($type === 'faculty') {
            $query = Faculty::with('department')->where('is_archived', false);
            if ($request->has('department') && $request->department != 'All Departments') {
                $query->where('department_id', $request->department);
            }
            $rows = $query->get();

            $filename = 'faculty_report_' . date('Ymd_His') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $columns = ['Faculty ID', 'Name', 'Department'];

            $callback = function() use ($rows, $columns) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);
                foreach ($rows as $r) {
                    fputcsv($file, [
                        $r->faculty_id,
                        $r->name,
                        optional($r->department)->name
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // default students
        $query = Student::with(['course', 'department'])->where('is_archived', false);
        if ($request->has('course') && $request->course != 'All Courses') {
            $query->where('course_id', $request->course);
        }
        $rows = $query->get();

        $filename = 'student_report_' . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $columns = ['Student ID', 'Name', 'Year Level', 'Course', 'Department', 'Status'];

        $callback = function() use ($rows, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($rows as $r) {
                fputcsv($file, [
                    $r->student_id,
                    $r->name,
                    $r->year_level,
                    optional($r->course)->name,
                    optional($r->department)->name,
                    $r->status
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
