<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = ['period', 'start_date', 'end_date', 'is_archived'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
