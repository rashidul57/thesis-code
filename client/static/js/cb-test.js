let cur_img_num = 1;
const patterns = [12, 8, 29, 5, 3, 15, 74, 6, 45, 26];
// const patterns = [12, 8];
let correct_count = 0;

$( document ).ready(() => {
    $('.btn-next').on('click', nav_next);
    $('.txt-input').focus();
    show_images();
});

function nav_next() {
    let value = $('.txt-input').val();
    if (!value) {
        alert('Please write your detection.');
        return;
    }
    value = Number(value);
    if (patterns[cur_img_num-1] === value) {
        correct_count++;
    }
    
    cur_img_num++;
    if (cur_img_num <= patterns.length) {
        $('.txt-input').val('').focus();
        show_images();
    } else {
        const perc = correct_count * 100/patterns.length;
        const msg = perc >= 70 ? 'Congratulations! You passed in detection test.' : 'Sorry! you cannot take part in the survey.';
        $('.container-box').addClass('result-mode');
        $('.image, .inputs').hide();
        $('.result').show();
        $('.result').html(msg);
    }
}

function show_images() {
    $('.img-item').attr('src', "../static/cb-images/" + cur_img_num + ".gif");
}