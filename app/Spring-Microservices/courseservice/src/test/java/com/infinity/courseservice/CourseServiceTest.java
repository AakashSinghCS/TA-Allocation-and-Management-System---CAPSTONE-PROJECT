package com.infinity.courseservice;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {
    
    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserInterface userInterface;

    @InjectMocks
    private CourseService courseService;

}
