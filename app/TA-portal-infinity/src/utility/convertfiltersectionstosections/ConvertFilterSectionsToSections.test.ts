import { describe, it, expect } from 'vitest';
import { convertFilterSectionsToSections } from './ConvertFilterSectionsToSections';
import type { FilterSectionsProps } from '../../api/course/sectionfilter/fetchFilteredSections';
import type { SectionType } from '../../interfaces/section/SectionDetails';

describe('convertFilterSectionsToSections', () => {
  const mockFilterSection: FilterSectionsProps = {
    sectionId: 1,
    courseId: 101,
    deptCode: 'COSC',
    name: 'Introduction to Programming',
    courseNum: '101',
    section: '001',
    year: 2024,
    semester: 'W1',
    type: 'LECTURE' as SectionType,
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    isCourse: true
  };

  describe('basic functionality', () => {
    it('converts single filter section to section object', () => {
      const filters = [mockFilterSection];
      const result = convertFilterSectionsToSections(filters);

      expect(result).toHaveLength(1);
      const section = result[0];
      
      expect(section.id).toBe(1);
      expect(section.course?.id).toBe(101);
      expect(section.course?.name).toBe('Introduction to Programming');
      expect(section.course?.deptCode).toBe('COSC');
      expect(section.course?.courseNum).toBe('101');
      expect(section.section).toBe('001');
      expect(section.year).toBe(2024);
      expect(section.semester).toBe('W1');
      expect(section.type).toBe('LECTURE');
    });

    it('creates section schedule from filter data', () => {
      const filters = [mockFilterSection];
      const result = convertFilterSectionsToSections(filters);

      const section = result[0];
      expect(section.sectionSchedule).toHaveLength(1);
      
      const schedule = section.sectionSchedule?.[0];
      expect(schedule?.day).toBe('Monday');
      expect(schedule?.startTime).toBe('09:00');
      expect(schedule?.endTime).toBe('10:30');
      expect(schedule?.sectionId).toBe(1);
    });

    it('sets undefined fields correctly', () => {
      const filters = [mockFilterSection];
      const result = convertFilterSectionsToSections(filters);

      const section = result[0];
      expect(section.need).toBeUndefined();
      expect(section.hasCompleted).toBeUndefined();
      expect(section.allocations).toBeUndefined();
      expect(section.instructor).toBeUndefined();
    });
  });

  describe('multiple schedules for same section', () => {
    it('groups multiple schedule entries for same section', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { ...mockFilterSection, day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
        { ...mockFilterSection, day: 'Friday', startTime: '09:00', endTime: '10:30' }
      ];
      
      const result = convertFilterSectionsToSections(filters);

      expect(result).toHaveLength(1);
      const section = result[0];
      expect(section.sectionSchedule).toHaveLength(3);
      
      const days = section.sectionSchedule?.map(s => s.day);
      expect(days).toContain('Monday');
      expect(days).toContain('Wednesday');
      expect(days).toContain('Friday');
    });

    it('preserves all schedule details for multiple entries', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { ...mockFilterSection, day: 'Wednesday', startTime: '14:00', endTime: '15:30' }
      ];
      
      const result = convertFilterSectionsToSections(filters);
      const schedules = result[0].sectionSchedule;

      expect(schedules).toHaveLength(2);
      
      const mondaySchedule = schedules?.find(s => s.day === 'Monday');
      expect(mondaySchedule?.startTime).toBe('09:00');
      expect(mondaySchedule?.endTime).toBe('10:30');
      
      const wednesdaySchedule = schedules?.find(s => s.day === 'Wednesday');
      expect(wednesdaySchedule?.startTime).toBe('14:00');
      expect(wednesdaySchedule?.endTime).toBe('15:30');
    });
  });

  describe('multiple sections', () => {
    it('creates separate sections for different sectionIds', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, sectionId: 1, section: '001' },
        { ...mockFilterSection, sectionId: 2, section: '002' }
      ];
      
      const result = convertFilterSectionsToSections(filters);

      expect(result).toHaveLength(2);
      
      const section1 = result.find(s => s.id === 1);
      const section2 = result.find(s => s.id === 2);
      
      expect(section1?.section).toBe('001');
      expect(section2?.section).toBe('002');
    });

    it('handles mixed section and schedule data', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, sectionId: 1, section: '001', day: 'Monday' },
        { ...mockFilterSection, sectionId: 1, section: '001', day: 'Wednesday' },
        { ...mockFilterSection, sectionId: 2, section: '002', day: 'Tuesday' }
      ];
      
      const result = convertFilterSectionsToSections(filters);

      expect(result).toHaveLength(2);
      
      const section1 = result.find(s => s.id === 1);
      const section2 = result.find(s => s.id === 2);
      
      expect(section1?.sectionSchedule).toHaveLength(2);
      expect(section2?.sectionSchedule).toHaveLength(1);
    });
  });

  describe('null and undefined handling', () => {
    it('handles invalid sectionId entries', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, sectionId: null },
        { ...mockFilterSection, sectionId: undefined },
        { ...mockFilterSection, sectionId: 1 }
      ];
      
      const result = convertFilterSectionsToSections(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      
      // Test empty array with only invalid sectionIds
      const invalidFilters: FilterSectionsProps[] = [
        { ...mockFilterSection, sectionId: null },
        { ...mockFilterSection, sectionId: undefined }
      ];
      
      const emptyResult = convertFilterSectionsToSections(invalidFilters);
      expect(emptyResult).toEqual([]);
    });

    it('handles null and undefined field values', () => {
      const filterWithNulls: FilterSectionsProps = {
        sectionId: 1,
        courseId: null,
        deptCode: null,
        name: null,
        courseNum: null,
        section: null,
        year: null,
        semester: null,
        type: null,
        day: null,
        startTime: null,
        endTime: null
      };
      
      const result = convertFilterSectionsToSections([filterWithNulls]);

      expect(result).toHaveLength(1);
      const section = result[0];
      
      expect(section.course?.id).toBeUndefined();
      expect(section.course?.name).toBeUndefined();
      expect(section.course?.deptCode).toBeUndefined();
      expect(section.course?.courseNum).toBeUndefined();
      expect(section.section).toBeUndefined();
      expect(section.year).toBeUndefined();
      expect(section.semester).toBeUndefined();
      expect(section.type).toBeUndefined();
    });

    it('handles missing field defaults', () => {
      // Test scheduleDay fallback
      const filterWithScheduleDay = {
        ...mockFilterSection,
        day: undefined,
        scheduleDay: 'Tuesday'
      } as any;
      
      const result1 = convertFilterSectionsToSections([filterWithScheduleDay]);
      const schedule1 = result1[0].sectionSchedule?.[0];
      expect(schedule1?.day).toBe('Tuesday');
      
      // Test empty string default when both day and scheduleDay missing
      const filterWithoutDay = {
        ...mockFilterSection,
        day: undefined
      };
      delete (filterWithoutDay as any).scheduleDay;
      
      const result2 = convertFilterSectionsToSections([filterWithoutDay]);
      const schedule2 = result2[0].sectionSchedule?.[0];
      expect(schedule2?.day).toBe('');
      
      // Test empty string defaults for missing time values
      const filterWithoutTimes: FilterSectionsProps = {
        ...mockFilterSection,
        startTime: undefined,
        endTime: undefined
      };
      
      const result3 = convertFilterSectionsToSections([filterWithoutTimes]);
      const schedule3 = result3[0].sectionSchedule?.[0];
      expect(schedule3?.startTime).toBe('');
      expect(schedule3?.endTime).toBe('');
    });
  });

  describe('edge cases', () => {
    it('handles edge cases and maintains data consistency', () => {
      // Test empty input array
      const emptyResult = convertFilterSectionsToSections([]);
      expect(emptyResult).toEqual([]);
      
      // Test different section types
      const labFilter: FilterSectionsProps = {
        ...mockFilterSection,
        sectionId: 2,
        type: 'LABORATORY' as SectionType
      };
      
      const typeResult = convertFilterSectionsToSections([labFilter]);
      expect(typeResult[0].type).toBe('LABORATORY');
      
      // Test sectionSchedule initialization
      const filters = [mockFilterSection];
      const result = convertFilterSectionsToSections(filters);
      
      expect(result[0].sectionSchedule).toBeDefined();
      expect(Array.isArray(result[0].sectionSchedule)).toBe(true);
      
      // Test Map key consistency with multiple schedules
      const multipleScheduleFilters: FilterSectionsProps[] = [
        { ...mockFilterSection, sectionId: 1, day: 'Monday' },
        { ...mockFilterSection, sectionId: 1, day: 'Tuesday' },
        { ...mockFilterSection, sectionId: 1, day: 'Wednesday' }
      ];
      
      const multiResult = convertFilterSectionsToSections(multipleScheduleFilters);
      
      expect(multiResult).toHaveLength(1);
      expect(multiResult[0].sectionSchedule).toHaveLength(3);
      expect(multiResult[0].id).toBe(1);
    });
  });

  describe('data integrity', () => {
    it('preserves original course data across multiple schedules', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, day: 'Monday' },
        { ...mockFilterSection, day: 'Wednesday' }
      ];
      
      const result = convertFilterSectionsToSections(filters);
      const section = result[0];
      
      expect(section.course?.name).toBe('Introduction to Programming');
      expect(section.course?.deptCode).toBe('COSC');
      expect(section.year).toBe(2024);
      expect(section.semester).toBe('W1');
    });

    it('correctly assigns sectionId to all schedules', () => {
      const filters: FilterSectionsProps[] = [
        { ...mockFilterSection, sectionId: 5, day: 'Monday' },
        { ...mockFilterSection, sectionId: 5, day: 'Wednesday' }
      ];
      
      const result = convertFilterSectionsToSections(filters);
      const schedules = result[0].sectionSchedule;
      
      schedules?.forEach(schedule => {
        expect(schedule.sectionId).toBe(5);
      });
    });
  });
});
