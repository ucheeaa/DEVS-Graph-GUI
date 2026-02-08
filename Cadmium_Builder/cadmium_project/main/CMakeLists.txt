
if(ESP_PLATFORM)
    idf_component_register( SRCS "main.cpp" "include/drivers/manchester_encoder.c"
                            REQUIRES driver
                            INCLUDE_DIRS "." "include" $ENV{CADMIUM})

    target_compile_options(${COMPONENT_LIB} PUBLIC -std=gnu++2b)
    target_compile_options(${COMPONENT_LIB} PRIVATE "-Wno-format")
    target_compile_options(${COMPONENT_LIB} PRIVATE "-frtti")
    target_compile_options(${COMPONENT_LIB} PRIVATE "-fexceptions")
    target_compile_options(${COMPONENT_LIB} PRIVATE "-DRT_ESP32")
    # target_compile_options(${COMPONENT_LIB} PRIVATE "-DNO_LOGGING")
    # target_compile_options(${COMPONENT_LIB} PRIVATE "-DNO_LOG_STATE")
    # target_compile_options(${COMPONENT_LIB} PRIVATE "-DDEBUG_DELAY")
else()
    message(STATUS "Configuring for non-ESP32")

    # Regular CMake project setup for non-ESP32
    add_executable(Executable1 main.cpp)

    # Base path of the project
    set(PROJECT_ROOT ${CMAKE_SOURCE_DIR})

    # Add include directories for Cadmium headers
    target_include_directories(Executable1 PRIVATE
        ${PROJECT_ROOT}               # root of cadmium_project
        ${PROJECT_ROOT}/cadmium       # cadmium folder with headers
        ${PROJECT_ROOT}/include       # your local include folder
    )

    # Non-ESP32 specific compile options
    target_compile_options(Executable1 PUBLIC -std=gnu++2b)
endif()
