#[no_mangle]
pub extern "C" fn process_stream(data: *const u8, len: usize) -> usize {
    let slice = unsafe { std::slice::from_raw_parts(data, len) };
    // Simulate stream processing
    slice.len()
}

#[no_mangle]
pub extern "C" fn aggregate_metrics(values: *const f32, len: usize) -> f32 {
    let slice = unsafe { std::slice::from_raw_parts(values, len) };
    
    if len == 0 {
        return 0.0;
    }
    
    let mut sum = 0.0;
    for i in 0..len {
        sum += slice[i];
    }
    
    sum / len as f32
}

#[no_mangle]
pub extern "C" fn detect_anomaly(value: f32, mean: f32, std_dev: f32) -> i32 {
    let z_score = (value - mean) / std_dev;
    if z_score.abs() > 3.0 {
        1
    } else {
        0
    }
}

#[no_mangle]
pub extern "C" fn moving_average(values: *const f32, len: usize, window: usize) -> f32 {
    let slice = unsafe { std::slice::from_raw_parts(values, len) };
    
    if len == 0 || window == 0 {
        return 0.0;
    }
    
    let actual_window = window.min(len);
    let start = len - actual_window;
    
    let mut sum = 0.0;
    for i in start..len {
        sum += slice[i];
    }
    
    sum / actual_window as f32
}

#[no_mangle]
pub extern "C" fn exponential_smoothing(value: f32, prev_smoothed: f32, alpha: f32) -> f32 {
    alpha * value + (1.0 - alpha) * prev_smoothed
}
