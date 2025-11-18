<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Student;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create admin user (only if doesn't exist)
        User::firstOrCreate(
            ['email' => 'admin@university.edu'],
            [
                'name' => 'admin',
                'password' => Hash::make('password'),
            ]
        );

        // Create departments (only if don't exist)
        $it = Department::firstOrCreate(['name' => 'Information Technology']);
        $cs = Department::firstOrCreate(['name' => 'Computer Science']);
        $ba = Department::firstOrCreate(['name' => 'Business Administration']);
        $eng = Department::firstOrCreate(['name' => 'Engineering']);
        $hm = Department::firstOrCreate(['name' => 'Hospitality Management']);

    // Create academic years (only if don't exist)
    AcademicYear::firstOrCreate(['period' => '2023 - 2024'], ['start_date' => '2023-08-01', 'end_date' => '2024-05-31']);
    AcademicYear::firstOrCreate(['period' => '2024 - 2025'], ['start_date' => '2024-08-01', 'end_date' => '2025-05-31']);
    AcademicYear::firstOrCreate(['period' => '2025 - 2026'], ['start_date' => '2025-08-01', 'end_date' => '2026-05-31']);

    // Use 2025 - 2026 as the default academic year for seeded students
    $ay = AcademicYear::where('period', '2025 - 2026')->first();

        // Create courses (only if don't exist)
        $bsit = Course::firstOrCreate(['name' => 'Bachelor of Science in Information Technology'], ['department_id' => $it->id, 'status' => 'Active']);
        $bscs = Course::firstOrCreate(['name' => 'Bachelor of Science in Computer Science'], ['department_id' => $cs->id, 'status' => 'Active']);
        $bsba = Course::firstOrCreate(['name' => 'Bachelor of Science in Business Administration'], ['department_id' => $ba->id, 'status' => 'Active']);
        $bse = Course::firstOrCreate(['name' => 'Bachelor of Science in Engineering'], ['department_id' => $eng->id, 'status' => 'Active']);
        $bshm = Course::firstOrCreate(['name' => 'Bachelor of Science in Hospitality Management'], ['department_id' => $hm->id, 'status' => 'Active']);

        // Create faculty (only if don't exist)
        Faculty::updateOrCreate(
            ['faculty_id' => 'FAC001'],
            ['name' => 'Dr. Robert C. Johnson', 'email' => 'drjohnson@gmail.com', 'phone' => '09631895387', 'position' => 'Dr.', 'hire_date' => '2015-06-01', 'department_id' => $it->id]
        );
        Faculty::updateOrCreate(
            ['faculty_id' => 'FAC002'],
            ['name' => 'Dr. Sarah E. Davis', 'email' => 'drdavis@gmail.com', 'phone' => '09607712041', 'position' => 'Dr.', 'hire_date' => '2016-08-15', 'department_id' => $cs->id]
        );
        Faculty::updateOrCreate(
            ['faculty_id' => 'FAC003'],
            ['name' => 'Prof. Mary D. Williams', 'email' => 'profwilliams@gmail.com', 'phone' => '09511120970', 'position' => 'Prof.', 'hire_date' => '2012-01-10', 'department_id' => $ba->id]
        );
        Faculty::updateOrCreate(
            ['faculty_id' => 'FAC004'],
            ['name' => 'Prof. Alfredo Ayaton', 'email' => 'profayaton@gmail.com', 'phone' => '09221690501', 'position' => 'Prof.', 'hire_date' => '2018-03-21', 'department_id' => $eng->id]
        );
        Faculty::updateOrCreate(
            ['faculty_id' => 'FAC005'],
            ['name' => 'Prof. Jeffer Loque', 'email' => 'profloque@gmail.com', 'phone' => '09427448788', 'position' => 'Prof.', 'hire_date' => '2019-11-05', 'department_id' => $hm->id]
        );

        // Create students (only if don't exist)
        Student::updateOrCreate(
            ['student_id' => 'STU001'],
            ['name' => 'Kirk Jendare Antig', 'email' => 'kirkantig@gmail.com', 'phone' => '09103845298', 'dob' => '2002-05-15', 'enrollment_date' => '2021-08-01', 'address' => 'Maern', 'academic_year_id' => $ay->id ?? null, 'year_level' => '3rd Year', 'course_id' => $bsit->id, 'department_id' => $it->id, 'status' => 'Active']
        );
        Student::updateOrCreate(
            ['student_id' => 'STU002'],
            ['name' => 'Esidore Ayaton', 'email' => 'esidoreayaton@gmail.com', 'phone' => '09029508885', 'dob' => '2002-09-10', 'enrollment_date' => '2021-08-01', 'address' => 'Pianing', 'academic_year_id' => $ay->id ?? null, 'year_level' => '3rd Year', 'course_id' => $bsit->id, 'department_id' => $it->id, 'status' => 'Active']
        );
        Student::updateOrCreate(
            ['student_id' => 'STU003'],
            ['name' => 'John Paul O. Boholst', 'email' => 'johnboholst@gmail.com', 'phone' => '09542639019', 'dob' => '2001-11-20', 'enrollment_date' => '2020-08-01', 'address' => 'Ampayern', 'academic_year_id' => $ay->id ?? null, 'year_level' => '3rd Year', 'course_id' => $bsit->id, 'department_id' => $it->id, 'status' => 'Active']
        );
        Student::updateOrCreate(
            ['student_id' => 'STU004'],
            ['name' => 'Alhamed Cebrano', 'email' => 'alhamedcebrano@gmail.com', 'phone' => '09046502435', 'dob' => '2003-01-12', 'enrollment_date' => '2022-08-01', 'address' => 'Patin-ay', 'academic_year_id' => $ay->id ?? null, 'year_level' => '2nd Year', 'course_id' => $bscs->id, 'department_id' => $cs->id, 'status' => 'Active']
        );
        Student::updateOrCreate(
            ['student_id' => 'STU005'],
            ['name' => 'Carl Vincent E. Dumo', 'email' => 'carldumo@gmail.com', 'phone' => '09479798215', 'dob' => '2003-07-22', 'enrollment_date' => '2022-08-01', 'address' => 'Merika', 'academic_year_id' => $ay->id ?? null, 'year_level' => '2nd Year', 'course_id' => $bsba->id, 'department_id' => $ba->id, 'status' => 'Active']
        );
        Student::updateOrCreate(
            ['student_id' => 'STU006'],
            ['name' => 'Jeffer Loque Empasis', 'email' => 'jefferempasis@gmail.com', 'phone' => '09849247089', 'dob' => '2004-03-30', 'enrollment_date' => '2024-08-01', 'address' => 'Tsina', 'academic_year_id' => $ay->id ?? null, 'year_level' => '1st Year', 'course_id' => $bse->id, 'department_id' => $eng->id, 'status' => 'Active']
        );
        Student::updateOrCreate(
            ['student_id' => 'STU007'],
            ['name' => 'James Kenneth Enriquez', 'email' => 'jamesenriquez@gmail.com', 'phone' => '09852939097', 'dob' => '2004-09-05', 'enrollment_date' => '2024-08-01', 'address' => 'Bading', 'academic_year_id' => $ay->id ?? null, 'year_level' => '1st Year', 'course_id' => $bshm->id, 'department_id' => $hm->id, 'status' => 'Active']
        );
    }
}
