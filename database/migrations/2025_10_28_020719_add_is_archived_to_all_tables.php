<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsArchivedToAllTables extends Migration
{
    public function up()
    {
        // Students
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('status');
            }
        });

        // Faculty
        Schema::table('faculty', function (Blueprint $table) {
            if (!Schema::hasColumn('faculty', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('department_id');
            }
        });

        // Courses
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('status');
            }
        });

        // Departments
        Schema::table('departments', function (Blueprint $table) {
            if (!Schema::hasColumn('departments', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('name');
            }
        });

        // Academic Years (if exists)
        if (Schema::hasTable('academic_years')) {
            Schema::table('academic_years', function (Blueprint $table) {
                if (!Schema::hasColumn('academic_years', 'is_archived')) {
                    $table->boolean('is_archived')->default(false)->after('end_date');
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('students') && Schema::hasColumn('students', 'is_archived')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('is_archived');
            });
        }

        if (Schema::hasTable('faculty') && Schema::hasColumn('faculty', 'is_archived')) {
            Schema::table('faculty', function (Blueprint $table) {
                $table->dropColumn('is_archived');
            });
        }

        if (Schema::hasTable('courses') && Schema::hasColumn('courses', 'is_archived')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->dropColumn('is_archived');
            });
        }

        if (Schema::hasTable('departments') && Schema::hasColumn('departments', 'is_archived')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->dropColumn('is_archived');
            });
        }

        if (Schema::hasTable('academic_years') && Schema::hasColumn('academic_years', 'is_archived')) {
            Schema::table('academic_years', function (Blueprint $table) {
                $table->dropColumn('is_archived');
            });
        }
    }
}
