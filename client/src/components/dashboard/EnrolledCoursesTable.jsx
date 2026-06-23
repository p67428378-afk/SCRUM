import React from "react";

export default function EnrolledCoursesTable({ courses = [] }) {
  return (
    <div className="xl:col-span-8 bg-surface-container-high border border-outline-variant rounded-lg overflow-hidden">
      <div className="p-card_padding border-b border-outline-variant flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Enrolled Courses
        </h3>
        <button className="text-primary hover:text-primary-fixed-dim transition-colors font-label-md text-label-md">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-highest/50">
              <th className="p-4 font-label-md text-label-md text-on-surface-variant">
                Course
              </th>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant">
                Instructor
              </th>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant">
                Grade
              </th>
              <th className="p-4 font-label-md text-label-md text-on-surface-variant">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-8 text-center text-on-surface-variant"
                >
                  No enrolled courses found.
                </td>
              </tr>
            ) : (
              courses.map((course, index) => (
                <tr
                  key={course.course_code || index}
                  className={`border-b border-outline-variant hover:bg-surface-container-highest transition-colors group cursor-pointer ${
                    index === courses.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-body-lg text-body-lg text-on-surface group-hover:text-primary transition-colors">
                        {course.course_name}
                      </span>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">
                        {course.course_code}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant">
                    {course.instructor}
                  </td>
                  <td className="p-4">
                    {course.grade ? (
                      <span className="bg-[#10B981]/10 text-[#10B981] px-2.5 py-1 rounded font-code-sm text-code-sm font-bold">
                        {course.grade}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant font-code-sm text-code-sm">
                        N/A
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-surface-container-lowest rounded-full h-1.5 max-w-[100px]">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        {course.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
