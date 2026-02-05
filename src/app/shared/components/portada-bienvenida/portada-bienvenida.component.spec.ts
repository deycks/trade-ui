import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortadaBienvenidaComponent } from './portada-bienvenida.component';

describe('PortadaBienvenidaComponent', () => {
  let component: PortadaBienvenidaComponent;
  let fixture: ComponentFixture<PortadaBienvenidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortadaBienvenidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortadaBienvenidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
