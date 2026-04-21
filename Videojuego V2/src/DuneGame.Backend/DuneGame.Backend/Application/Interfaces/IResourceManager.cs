using DuneGame.Backend.Domain.Models;

namespace DuneGame.Backend.Application.Interfaces;

public interface IResourceManager
{
    (bool success, string? error) TryDeductResources(ResourceCost cost);
    void AddResources(int funds = 0, int water = 0, int food = 0, int prestige = 0, int staff = 0, int bioData = 0, int containment = 0);
    ResourceState GetResources();
}
