<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';
    protected $fillable = [
        'faculty_id',
        'name',
        'email',
        'phone',
        'position',
        'hire_date',
        'department_id',
        'status',
        'is_archived'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
