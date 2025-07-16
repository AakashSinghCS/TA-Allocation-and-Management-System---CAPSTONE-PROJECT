import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { fetchApplicationsByStudent } from "../../../api/application/FetchApplicationsByStudent";

import { fetchExamAvailability, submitExamAvailability } from "../../../api/exam/ExamAvailability";
import { useAuth } from "../../../context/AuthContext";
import type { EventInput } from '@fullcalendar/core';
import type { ExamAvailabilityDto } from "../../../interfaces/exam/ExamAvailability";
import { deleteExamAvailability } from "../../../api/exam/ExamAvailability";



const GraduateAvailabilityPage = () => {
  const navigate = useNavigate();
  const { token, userId, userRoles } = useAuth();
  const currentYear = new Date().getFullYear();
  const [events, setEvents] = useState<EventInput[]>([]);

  const [isGraduate, setIsGraduate] = useState<boolean | null>(null);

  const getRandomColor = () => {
    const colors = [
      "#1abc9c", "#3498db", "#9b59b6", "#f39c12", "#e74c3c",
      "#2ecc71", "#e67e22", "#34495e", "#16a085", "#8e44ad"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  useEffect(() => {

    const checkGraduateStatusAndLoadAvailability = async () => {

      try {
        const applications = await fetchApplicationsByStudent(userId, token!);
        const thisYearApp = applications.find(app => new Date(app.timeSubmitted).getFullYear() === currentYear);


        if (thisYearApp?.applicationType === "GRADUATE") {
          setIsGraduate(true);

          const saved = await fetchExamAvailability(userId, token!);
          const formatted = saved.map((a: ExamAvailabilityDto) => ({
            title: "Available",
            start: `${a.date}T${a.startTime}`,
            end: `${a.date}T${a.endTime}`,
            backgroundColor: getRandomColor(),
          }));
          setEvents(formatted);

        } else {
          setIsGraduate(false);
        }
      } catch (error) {

        console.error("Failed to load page data: ", error);

        navigate("/user/student/home");
      }
    };


    checkGraduateStatusAndLoadAvailability();



  }, [userId, token, navigate, currentYear]);

  if (isGraduate === null) return <div>Loading...</div>;

  if (isGraduate === false) {
    return (
        <div className="p-4 text-center text-red-600 font-semibold">
            Only graduate students with a current year application can access this page.
        </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Final Exam Availability</h1>
      <div style={{ height: "400px", overflowY: "auto" }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          selectMirror={true}
          slotMinTime="06:00:00"
          slotMaxTime="17:01:00"
          height={"auto"}
          select={(info) => {
            const newEvent = {
              title: "Available",
              start: info.startStr,
              end: info.endStr,
              backgroundColor: getRandomColor(),
              allDay: false
            };
            setEvents((prev) => [...prev, newEvent]);
          }}
          events={events}
          customButtons={{
            clearAll: {
              text: 'Reset',

              click: async () => {
                const confirmed = window.confirm("Are you sure you want to delete all your availability?");
                if (!confirmed) return;

                try {
                  await deleteExamAvailability(userId, token!);
                  setEvents([]);
                  alert("All availability has been cleared.");
                } catch (error) {
                  console.error(error);
                  alert("Failed to clear availability. Please try again.");
                }
              },
            },
          }}


          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "clearAll"
          }}
          allDaySlot={false}
        />
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={async () => {
            try {
              await submitExamAvailability(userId, events, token!);
              alert("Availability submitted successfully!");
            } catch (error) {
              alert("Please click the reset button if you want to update your availability.");
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Submit Availability
        </button>
      </div>

    </div>
  );
  
};
export default GraduateAvailabilityPage;

