var out=[]; var q=function(s){return document.querySelector(s);};
q('#unitAll').click();
q('#factsFab').click();
var b=q('#factsBox');
b.style.transition='none';
b.style.transform='translateY(0)';
b.style.opacity='1';
void b.offsetHeight;
var r=b.getBoundingClientRect();
var cs=getComputedStyle(b);
out.push('after killing transition: transform='+cs.transform+' opacity='+cs.opacity+
  ' rect='+Math.round(r.top)+'..'+Math.round(r.bottom)+' vh='+window.innerHeight);
out.push('opened class present: '+b.classList.contains('open'));
document.getElementById('__out').textContent=out.join('\n');
