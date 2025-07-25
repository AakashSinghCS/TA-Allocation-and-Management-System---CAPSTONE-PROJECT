import { fetchAllocationByStatus } from "../allocation/fetchAllocationByStatus";
import type { Allocation } from "../../interfaces/allocation/Allocation";
import type Section from "../../interfaces/section/Section";

/**
 * Fetches confirmed allocations for a specific section
 * @param sectionId The ID of the section to filter allocations for
 * @param token Optional authentication token
 * @returns Array of confirmed allocations for the section
 */
export async function fetchConfirmedAllocationsBySection(
  sectionId: number, 
  token?: string
): Promise<Allocation[]> {
  try {
    // Fetch all confirmed allocations
    const allConfirmedAllocations = await fetchAllocationByStatus("CONFIRMED", token);
    
    // Log the total number of allocations fetched
    console.log(`[fetchConfirmedAllocationsBySection] Total confirmed allocations: ${allConfirmedAllocations.length}`);
    
    // Filter to only include allocations for the specified section
    const sectionAllocations = allConfirmedAllocations.filter(
      allocation => allocation.section?.id === sectionId
    );
    
    // Log the number of allocations for this section
    console.log(`[fetchConfirmedAllocationsBySection] Allocations for section ${sectionId}: ${sectionAllocations.length}`);
    
    return sectionAllocations;
  } catch (error) {
    console.error(`[fetchConfirmedAllocationsBySection] Error fetching allocations for section ${sectionId}:`, error);
    return [];
  }
}

/**
 * Fetches confirmed allocations for multiple sections
 * @param sections Array of sections to fetch allocations for
 * @param token Optional authentication token
 * @returns Original sections with their allocations populated
 */
export async function fetchConfirmedAllocationsForSections(
  sections: Section[],
  token?: string
): Promise<Section[]> {
  try {
    // If there are no sections, just return empty array
    if (!sections.length) {
      return [];
    }
    
    // Get all confirmed allocations in one request
    const allConfirmedAllocations = await fetchAllocationByStatus("CONFIRMED", token);
    console.log(`[fetchConfirmedAllocationsForSections] Total confirmed allocations: ${allConfirmedAllocations.length}`);
    
    // Create a new array of sections with their allocations populated
    const sectionsWithAllocations = sections.map(section => {
      // Find all allocations for this specific section
      const sectionAllocations = allConfirmedAllocations.filter(
        allocation => allocation.section?.id === section.id
      );
      
      // Return a new section object with allocations
      return {
        ...section,
        allocations: sectionAllocations
      };
    });
    
    return sectionsWithAllocations;
  } catch (error) {
    console.error('[fetchConfirmedAllocationsForSections] Error fetching allocations:', error);
    // Return the original sections without allocations
    return sections;
  }
}
